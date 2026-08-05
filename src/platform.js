// platform.js — 截图 & 窗口列表（Windows PowerShell）
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir, homedir } from "node:os";
import { config } from "./config.js";

function runPS(script, timeout = 15000) {
  const f = join(tmpdir(), "vs-" + Date.now() + ".ps1");
  writeFileSync(f, "\ufeff" + script, "utf-8");
  try {
    return execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${f}"`, {
      encoding: "utf-8", timeout, windowsHide: true,
    }).trim();
  } finally {
    try { unlinkSync(f); } catch {}
  }
}

export function fileExists(p) { return existsSync(p); }
export function filePath(p) { return p; }

export function listWindows() {
  const ps = `
${DPI_PREAMBLE}
Add-Type @"
using System; using System.Collections.Generic; using System.Runtime.InteropServices; using System.Text;
public class WL {
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc cb, IntPtr lp);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  public delegate bool EnumWindowsProc(IntPtr h, IntPtr lp);
  public static List<string> T = new List<string>();
  public static bool CB(IntPtr h, IntPtr lp) {
    if (IsWindowVisible(h)) { int n = GetWindowTextLength(h); if (n > 0) { StringBuilder sb = new StringBuilder(n+1); GetWindowText(h, sb, sb.Capacity); string t = sb.ToString().Trim(); if (!string.IsNullOrEmpty(t)) T.Add(t); } }
    return true;
  }
}
"@
[WL]::EnumWindows([WL+EnumWindowsProc]{ param($h,$p); [WL]::CB($h,$p) }, [IntPtr]::Zero) | Out-Null
for($i=0; $i -lt [WL]::T.Count; $i++) { Write-Output $([WL]::T[$i]) }`.trim();
  const out = runPS(ps);
  return out ? out.split("\n").filter(l => l.trim()) : [];
}

export function screenshot(mode = "primary", windowTitle = null, filename = null) {
  let dir = config.screenshotDir;
  try { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); }
  catch { dir = join(homedir(), "Pictures", "Screenshots"); }
  try { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); }
  catch { dir = homedir(); }
  const fname = (filename || `screenshot-${Date.now()}`).replace(/\.(png|jpg)$/i, "") + ".jpg";
  const fp = join(dir, fname);
  const fpEsc = fp.replace(/\\/g, "\\\\");

  // 窗口截图：PrintWindow
  if (mode === "window" && windowTitle) {
    const ps = `
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System; using System.Collections.Generic; using System.Runtime.InteropServices; using System.Text;
public class WC {
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWinProc cb, IntPtr lp);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint f);
  public delegate bool EnumWinProc(IntPtr h, IntPtr lp);
  public struct RECT { public int L,T,R,B; }
  public static string S; public static IntPtr F = IntPtr.Zero;
  public static bool CB(IntPtr h, IntPtr lp) { if(IsWindowVisible(h)){ StringBuilder sb=new StringBuilder(256); GetWindowText(h,sb,256); if(sb.ToString().ToLower().Contains(S.ToLower())){F=h;return false;} } return true; }
  public static IntPtr Find(string t){ S=t; F=IntPtr.Zero; EnumWindows(new EnumWinProc(CB),IntPtr.Zero); return F; }
}
"@
$hwnd = [WC]::Find('${windowTitle.replace(/'/g, "''")}')
if($hwnd -eq [IntPtr]::Zero){ throw "窗口未找到: ${windowTitle.replace(/'/g, "''")}" }
$r=[WC]::GetBounds($hwnd); $w=$r.R-$r.L; $h=$r.B-$r.T
$bmp=New-Object System.Drawing.Bitmap($w,$h); $g=[System.Drawing.Graphics]::FromImage($bmp)
$hdc=$g.GetHdc(); [WC]::PrintWindow($hwnd,$hdc,2)|Out-Null; $g.ReleaseHdc($hdc)
$eps=New-Object System.Drawing.Imaging.EncoderParameters(1); $eps.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,80L)
$jc=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|Where-Object{$_.MimeType -eq 'image/jpeg'}
$bmp.Save('${fpEsc}',$jc,$eps); $g.Dispose(); $bmp.Dispose()
Write-Output '${fpEsc}'`;
    const out = runPS(ps);
    const result = out.split("\n").pop().trim();
    if (result && existsSync(result.replace(/\\\\/g, "\\"))) return result.replace(/\\\\/g, "\\");
    if (existsSync(fp)) return fp;
    throw new Error("窗口截图失败: " + out);
  }

  // 全屏截图：多方法 fallback
  const methods = [
    // 方法1：CopyFromScreen + DPI 感知
    `
Add-Type @"
using System; using System.Runtime.InteropServices;
public class DPI { [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); }
"@
[DPI]::SetProcessDPIAware() | Out-Null
Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
Add-Type -AssemblyName System.Drawing
$bmp = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$img = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height)
$g = [System.Drawing.Graphics]::FromImage($img)
$g.CopyFromScreen($bmp.Location, [System.Drawing.Point]::Empty, $bmp.Size)
$eps=New-Object System.Drawing.Imaging.EncoderParameters(1); $eps.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,80L)
$jc=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|Where-Object{$_.MimeType -eq 'image/jpeg'}
$img.Save('${fpEsc}',$jc,$eps); $g.Dispose(); $img.Dispose()
Write-Output '${fpEsc}'
`,
    // 方法2：GDI BitBlt + DPI 感知
    `
Add-Type @"
using System; using System.Runtime.InteropServices;
public class DPI { [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); }
public class GC {
  [DllImport("user32.dll")] public static extern int GetSystemMetrics(int n);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateDC(string d,string dv,string o,IntPtr dt);
  [DllImport("gdi32.dll")] public static extern bool BitBlt(IntPtr dd,int x,int y,int w,int h,IntPtr ds,int sx,int sy,uint r);
  [DllImport("gdi32.dll")] public static extern bool DeleteDC(IntPtr dc);
}
"@
[DPI]::SetProcessDPIAware() | Out-Null
Add-Type -AssemblyName System.Drawing
$x=[GC]::GetSystemMetrics(76); $y=[GC]::GetSystemMetrics(77); $w=[GC]::GetSystemMetrics(78); $h=[GC]::GetSystemMetrics(79)
$bmp=New-Object System.Drawing.Bitmap($w,$h); $g=[System.Drawing.Graphics]::FromImage($bmp)
$hd=$g.GetHdc(); $hs=[GC]::CreateDC("DISPLAY",$null,$null,[IntPtr]::Zero)
[GC]::BitBlt($hd,0,0,$w,$h,$hs,$x,$y,0x00CC0020)|Out-Null
$g.ReleaseHdc($hd); [GC]::DeleteDC($hs)|Out-Null
$eps=New-Object System.Drawing.Imaging.EncoderParameters(1); $eps.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,80L)
$jc=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|Where-Object{$_.MimeType -eq 'image/jpeg'}
$bmp.Save('${fpEsc}',$jc,$eps); $g.Dispose(); $bmp.Dispose()
Write-Output '${fpEsc}'
`,
    // 方法3：最简单的 CopyFromScreen（无 DPI 设置）
    `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$s=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$i=New-Object System.Drawing.Bitmap($s.Width,$s.Height)
[System.Drawing.Graphics]::FromImage($i).CopyFromScreen($s.Location,[System.Drawing.Point]::Empty,$s.Size)
$i.Save('${fpEsc}',[System.Drawing.Imaging.ImageFormat]::Jpeg)
$i.Dispose()
Write-Output '${fpEsc}'
`,
  ];

  let lastError;
  for (const ps of methods) {
    try {
      const out = runPS(ps);
      const result = out.split("\n").pop().trim();
      const savedPath = result.replace(/\\\\/g, "\\");
      if (savedPath && existsSync(savedPath)) return savedPath;
      if (existsSync(fp)) return fp;
      lastError = "输出无效: " + out;
    } catch (e) {
      lastError = e.message;
    }
  }
  throw new Error("截图失败（尝试了3种方法均失败）。最后错误: " + lastError);
}
