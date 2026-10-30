; Weechat-Setup.exe — installateur tout-en-un (Inno Setup 6)
[Setup]
AppName=Weechat Swap Live
AppVersion=0.1.0
AppPublisher=Weechat
DefaultDirName={autopf}\Weechat
DefaultGroupName=Weechat
OutputDir=..\..\dist-installer
OutputBaseFilename=Weechat-Setup
Compression=lzma2
SolidCompression=yes
DiskSpanning=no
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
WizardStyle=modern

[Languages]
Name: "fr"; MessagesFile: "compiler:Languages\French.isl"

[Files]
Source: "dist\Weechat\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion
Source: "build-assets\models\*"; DestDir: "{app}\models"; Flags: recursesubdirs ignoreversion
Source: "build-assets\vcam\UnityCaptureFilter64.dll"; DestDir: "{app}\vcam"; Flags: ignoreversion regserver 64bit
Source: "build-assets\vcam\UnityCaptureFilter32.dll"; DestDir: "{app}\vcam"; Flags: ignoreversion regserver 32bit

[Icons]
Name: "{group}\Weechat Swap Live"; Filename: "{app}\Weechat.exe"
Name: "{autodesktop}\Weechat Swap Live"; Filename: "{app}\Weechat.exe"

[Run]
Filename: "{app}\Weechat.exe"; Description: "Lancer Weechat Swap Live"; Flags: nowait postinstall skipifsilent
