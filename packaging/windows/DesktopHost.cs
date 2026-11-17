using System;
using System.IO;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using System.Runtime.InteropServices;
using System.Web.Script.Serialization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;

class DesktopHost {
  const string Title = "VaultCraft Studio";
  static string root = AppDomain.CurrentDomain.BaseDirectory;
  static string data = Environment.GetEnvironmentVariable("VAULTCRAFT_DATA_DIR") ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "VaultCraft");
  static Window window;
  static WebView2 view;
  static bool closing;
  static bool smoke;
  static Process startup;
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern IntPtr FindWindow(string cls, string title);
  [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] static extern bool PostMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
  static int Server(string arg) {
    using(var p = Process.Start(new ProcessStartInfo(Path.Combine(root,"VaultCraft.Server.exe"),arg) { UseShellExecute=false, CreateNoWindow=true, WorkingDirectory=root })) {
      startup = p;
      if(!p.WaitForExit(75000)) { p.Kill(); throw new Exception("O arranque demorou demasiado. Tenta abrir novamente o programa."); }
      startup = null;
      return p.ExitCode;
    }
  }
  static void Log(Exception e) { try { File.AppendAllText(Path.Combine(data,"desktop.log"), DateTime.Now.ToString("s")+" "+e+Environment.NewLine); } catch {} }
  static void External(string url) {
    Uri uri;
    if(Uri.TryCreate(url,UriKind.Absolute,out uri) && (uri.Scheme=="https" || uri.Scheme=="http"))
      Process.Start(new ProcessStartInfo(uri.AbsoluteUri) { UseShellExecute=true });
  }
  [STAThread] static int Main(string[] args) {
    Directory.CreateDirectory(data);
    if(Array.IndexOf(args,"--stop")>=0) {
      var h=FindWindow(null,Title);
      if(h!=IntPtr.Zero) {
        PostMessage(h,0x0010,IntPtr.Zero,IntPtr.Zero);
        for(int i=0;i<100 && FindWindow(null,Title)!=IntPtr.Zero;i++) Thread.Sleep(100);
      }
      try { return Server("--stop"); } catch(Exception e) { Log(e); return 1; }
    }
    if(Array.IndexOf(args,"--check-desktop-runtime")>=0) {
      try { File.WriteAllText(Path.Combine(data,"desktop-runtime.txt"),CoreWebView2Environment.GetAvailableBrowserVersionString()); return 0; }
      catch(Exception e) { Log(e); return 1; }
    }
    smoke=Array.IndexOf(args,"--ui-smoke-test")>=0;
    bool first;
    using(var mutex=new Mutex(true,"Local\\VaultCraft-Desktop-"+System.Security.Principal.WindowsIdentity.GetCurrent().User.Value,out first)) {
      if(!first) { var h=FindWindow(null,Title); if(h!=IntPtr.Zero) {ShowWindow(h,9);SetForegroundWindow(h);} return 0; }
      var app=new Application();
      app.ShutdownMode=ShutdownMode.OnMainWindowClose;
      window=new Window {Title=Title,Width=1380,Height=900,MinWidth=940,MinHeight=640,WindowStartupLocation=WindowStartupLocation.CenterScreen,Background=new SolidColorBrush(Color.FromRgb(12,15,23))};
      string icon=Path.Combine(root,"app","public","vaultcraft.ico");
      if(File.Exists(icon)) window.Icon=BitmapFrame.Create(new Uri(icon));
      window.Content=new TextBlock {Text="A abrir VaultCraft Studio…",Foreground=Brushes.White,FontSize=22,HorizontalAlignment=HorizontalAlignment.Center,VerticalAlignment=VerticalAlignment.Center};
      window.Loaded+=async delegate { await Open(); };
      window.Closed+=delegate {
        closing=true;
        if(view!=null) view.Dispose();
        // Await any startup before stopping, so closing the splash cannot leave a server behind.
        if(!smoke) { try { if(startup!=null) startup.WaitForExit(75000); Server("--stop"); } catch(Exception e) {Log(e);} }
      };
      try { app.Run(window); return Environment.ExitCode; }
      catch(Exception e) { Log(e); MessageBox.Show("Não foi possível abrir o VaultCraft. Executa novamente o instalador.\n\n"+e.Message,Title); return 1; }
      finally { mutex.ReleaseMutex(); }
    }
  }
  static async Task Open() {
    try {
      CoreWebView2Environment.GetAvailableBrowserVersionString();
      string url=null;
      if(!smoke) {
        int result=await Task.Run(()=>Server("--no-browser"));
        if(closing) return;
        if(result!=0) throw new Exception("Não foi possível iniciar o serviço local. Consulta arranque.log na pasta de dados.");
        var state=new JavaScriptSerializer().Deserialize<System.Collections.Generic.Dictionary<string,object>>(File.ReadAllText(Path.Combine(data,"instance.json")));
        url="http://127.0.0.1:"+state["port"]+"/";
      }
      view=new WebView2();
      window.Content=view;
      var env=await CoreWebView2Environment.CreateAsync(null,Path.Combine(data,"DesktopProfile"));
      if(closing) return;
      await view.EnsureCoreWebView2Async(env);
      view.CoreWebView2.Settings.AreDevToolsEnabled=false;
      view.CoreWebView2.Settings.IsStatusBarEnabled=false;
      view.CoreWebView2.Settings.AreDefaultContextMenusEnabled=false;
      view.CoreWebView2.Settings.IsZoomControlEnabled=true;
      view.CoreWebView2.NewWindowRequested+=(sender,e)=>{e.Handled=true; External(e.Uri);};
      view.CoreWebView2.PermissionRequested+=(sender,e)=>{e.State=CoreWebView2PermissionState.Deny;};
      if(smoke) {
        view.CoreWebView2.NavigationCompleted+=async (sender,e)=>{
          File.WriteAllText(Path.Combine(data,"desktop-smoke.txt"),e.IsSuccess?"PASS: native WPF window and embedded WebView2":"FAIL: "+e.WebErrorStatus);
          if(!e.IsSuccess) Environment.ExitCode=1;
          await Task.Delay(2500); window.Close();
        };
        view.NavigateToString("<!doctype html><html><head><title>VaultCraft Studio</title></head><body style='background:#0c0f17;color:white;font:24px Segoe UI;padding:48px'><h1>VaultCraft Studio</h1><p>Janela própria da aplicação</p></body></html>");
      } else {
        var origin=new Uri(url);
        view.CoreWebView2.NavigationStarting+=(sender,e)=>{
          Uri destination;
          if(!Uri.TryCreate(e.Uri,UriKind.Absolute,out destination) || destination.Scheme!=origin.Scheme || destination.Authority!=origin.Authority) {
            e.Cancel=true; if(e.IsUserInitiated) External(e.Uri);
          }
        };
        view.Source=origin;
      }
    } catch(Exception e) {
      Log(e); Environment.ExitCode=1;
      if(smoke) {File.WriteAllText(Path.Combine(data,"desktop-smoke.txt"),"FAIL: "+e);window.Close();return;}
      if(!closing) {
        window.Content=new TextBlock {Text="Não foi possível abrir o VaultCraft.\n\n"+e.Message+"\n\nExecuta novamente o instalador para reparar os componentes.",Foreground=Brushes.White,FontSize=18,TextWrapping=TextWrapping.Wrap,Margin=new Thickness(40)};
      }
    }
  }
}
