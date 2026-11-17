using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Diagnostics;
using System.Threading;
using System.Windows.Forms;
using System.Web.Script.Serialization;

class Launcher {
  class State { public int port; public int pid; public string token; }
  static string root = AppDomain.CurrentDomain.BaseDirectory;
  static string data = Environment.GetEnvironmentVariable("VAULTCRAFT_DATA_DIR") ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "VaultCraft");
  static JavaScriptSerializer json = new JavaScriptSerializer();
  static string stateFile { get { return Path.Combine(data, "instance.json"); } }
  static bool Alive(State s) {
    if(s == null || s.port < 1 || String.IsNullOrEmpty(s.token)) return false;
    try {
      var req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:"+s.port+"/__vaultcraft/health");
      req.Proxy = null; req.Timeout = 1500;
      using(var res = req.GetResponse()) using(var reader = new StreamReader(res.GetResponseStream())) return reader.ReadToEnd() == s.token;
    } catch { return false; }
  }
  static State ReadState() { try { return json.Deserialize<State>(File.ReadAllText(stateFile)); } catch { return null; } }
  static string Quote(string s) { return "\""+s+"\""; }
  [STAThread] static int Main(string[] args) {
    bool quiet = Array.IndexOf(args,"--no-browser") >= 0 || Array.IndexOf(args,"--stop") >= 0;
    try {
      Directory.CreateDirectory(data);
      using(var mutex = new Mutex(false,"Local\\VaultCraft-"+System.Security.Principal.WindowsIdentity.GetCurrent().User.Value)) {
        bool locked = false;
        try {
          try { locked = mutex.WaitOne(90000); } catch(AbandonedMutexException) { locked = true; }
          if(!locked) throw new Exception("O arranque anterior ainda está em curso. Tente novamente dentro de alguns segundos.");
          State s = ReadState();
          if(Array.IndexOf(args,"--stop") >= 0) {
            if(Alive(s)) {
              var p = Process.GetProcessById(s.pid);
              if(String.Equals(p.MainModule.FileName,Path.Combine(root,"runtime","node.exe"),StringComparison.OrdinalIgnoreCase)) { p.Kill(); p.WaitForExit(10000); File.Delete(stateFile); }
            }
            return 0;
          }
          if(!Alive(s)) {
            string node = Path.Combine(root,"runtime","node.exe");
            string template = Path.Combine(root,"app","prisma","template.db");
            if(!File.Exists(node) || !File.Exists(template)) throw new Exception("A instalação está incompleta. Execute novamente o instalador.");
            string db = Path.Combine(data,"vaultcraft.db");
            if(!File.Exists(db)) File.Copy(template,db,false);
            Directory.CreateDirectory(Path.Combine(data,"backups"));
            var listener = new TcpListener(IPAddress.Loopback,0); listener.Start();
            int port = ((IPEndPoint)listener.LocalEndpoint).Port; listener.Stop();
            s = new State {port=port,token=Guid.NewGuid().ToString("N")};
            var info = new ProcessStartInfo(node,Quote(Path.Combine(root,"bootstrap.cjs"))) {UseShellExecute=false,CreateNoWindow=true,WorkingDirectory=Path.Combine(root,"app")};
            info.EnvironmentVariables["NODE_ENV"]="production";
            info.EnvironmentVariables["HOSTNAME"]="127.0.0.1";
            info.EnvironmentVariables["PORT"]=port.ToString();
            info.EnvironmentVariables["DATABASE_URL"]="file:"+db.Replace('\\','/');
            info.EnvironmentVariables["VAULTCRAFT_DATA_DIR"]=data;
            info.EnvironmentVariables["VAULTCRAFT_INSTANCE_TOKEN"]=s.token;
            var process = Process.Start(info); s.pid = process.Id;
            File.WriteAllText(stateFile,json.Serialize(s));
            var timer = Stopwatch.StartNew();
            while(!Alive(s) && timer.ElapsedMilliseconds < 60000) {
              if(process.HasExited) throw new Exception("O servidor terminou durante o arranque. Consulte "+Path.Combine(data,"servidor.log"));
              Thread.Sleep(300);
            }
            if(!Alive(s)) { if(!process.HasExited) process.Kill(); throw new Exception("O programa demorou demasiado a arrancar. Consulte "+Path.Combine(data,"servidor.log")); }
          }
          // The desktop host owns the window; this helper never opens a browser.
          return 0;
        } finally { if(locked) mutex.ReleaseMutex(); }
      }
    } catch(Exception e) {
      try { File.AppendAllText(Path.Combine(data,"arranque.log"),DateTime.Now.ToString("s")+" "+e+Environment.NewLine); } catch {}
      if(!quiet) MessageBox.Show(e.Message,"VaultCraft Studio",MessageBoxButtons.OK,MessageBoxIcon.Error);
      return 1;
    }
  }
}
