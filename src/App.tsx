import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ChevronRight, ChevronDown, Folder, FileVideo, Home, ArrowLeft, FolderOpen, Layers, Image, FileText, File } from 'lucide-react';
import './App.css';

interface DirContents {
  folders: string[];
  files: string[];
}

interface FileGroup {
  prefix: string;
  files: string[];
}

function getFileType(filename: string): 'video' | 'image' | 'document' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpg', 'mpeg'];
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'];
  
  if (videoExts.includes(ext)) return 'video';
  if (imageExts.includes(ext)) return 'image';
  if (docExts.includes(ext)) return 'document';
  return 'other';
}

function getFileIcon(filename: string, className: string = "file-icon") {
  const type = getFileType(filename);
  
  switch (type) {
    case 'video':
      return <FileVideo className={className} />;
    case 'image':
      return <Image className={className} />;
    case 'document':
      return <FileText className={className} />;
    default:
      return <File className={className} />;
  }
}

function FileNameWithGreyExtension({ filename }: { filename: string }) {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return <>{filename}</>;
  
  const name = filename.substring(0, lastDotIndex);
  const ext = filename.substring(lastDotIndex);
  
  return (
    <>
      {name}<span className="file-extension">{ext}</span>
    </>
  );
}

function longestCommonPrefix(str1: string, str2: string): string {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
    i++;
  }
  return str1.substring(0, i);
}

function groupFilesByPrefix(files: string[]): FileGroup[] {
  if (files.length === 0) return [];
  
  const sorted = [...files].sort();
  const groups: FileGroup[] = [];
  const used = new Set<number>();
  
  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue;
    
    const currentFile = sorted[i];
    const group: FileGroup = { prefix: currentFile, files: [currentFile] };
    used.add(i);
    
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue;
      
      const prefix = longestCommonPrefix(currentFile, sorted[j]);
      
      if (prefix.length >= 3) {
        group.files.push(sorted[j]);
        used.add(j);
        
        if (prefix.length < group.prefix.length) {
          group.prefix = prefix;
        }
      }
    }
    
    group.prefix = group.prefix.replace(/[\d\-_]+$/, '');
    groups.push(group);
  }
  
  return groups;
}

function FileGroupComponent({ 
  group, 
  folderPath, 
  onOpenFile 
}: { 
  group: FileGroup; 
  folderPath: string; 
  onOpenFile: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSingle = group.files.length === 1;
  
  const handleClick = () => {
    if (isSingle) {
      onOpenFile(`${folderPath}/${group.files[0]}`);
    } else {
      setExpanded(!expanded);
    }
  };
  
  return (
    <div className="file-group-wrapper">
      <div
        className={`file-group ${isSingle ? 'single' : 'multiple'} ${expanded ? 'expanded' : ''}`}
        onClick={handleClick}
      >
        <div className="file-group-icon">
          {!isSingle && (
            expanded ? 
              <ChevronDown className="chevron" /> : 
              <ChevronRight className="chevron" />
          )}
          {isSingle && <div className="spacer" />}
        </div>
        
        <div className="file-icon-wrapper">
          {isSingle ? (
            getFileIcon(group.files[0], "file-icon single")
          ) : (
            <div className="file-stack">
              {getFileIcon(group.files[0], "file-icon stack-icon back")}
              {getFileIcon(group.files[0], "file-icon stack-icon front")}
            </div>
          )}
        </div>
        
        <div className="file-info">
          <span className="file-name">
            {isSingle ? <FileNameWithGreyExtension filename={group.files[0]} /> : (group.prefix || group.files[0])}
          </span>
          {!isSingle && <span className="file-count">{group.files.length} files</span>}
        </div>
      </div>
      
      {expanded && !isSingle && (
        <div className="file-list">
          {group.files.map((file, idx) => (
            <div
              key={idx}
              className="file-item"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFile(`${folderPath}/${file}`);
              }}
            >
              <div className="file-item-icon">
                {getFileIcon(file, "small-icon")}
              </div>
              <span className="file-item-name">
                <FileNameWithGreyExtension filename={file} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FolderView({ 
  path, 
  onNavigate, 
  onOpenFile 
}: { 
  path: string; 
  onNavigate: (path: string) => void; 
  onOpenFile: (path: string) => void;
}) {
  const [data, setData] = useState<DirContents>({ folders: [], files: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadFolder();
  }, [path]);
  
  const loadFolder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await invoke<DirContents>('read_directory', { path });
      setData(result);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };
  
  const fileGroups = groupFilesByPrefix(data.files);
  
  if (loading) {
    return <div className="status-message">Loading...</div>;
  }
  
  if (error) {
    return <div className="status-message error">Error: {error}</div>;
  }
  
  return (
    <div className="content-grid">
      {data.folders.length > 0 && (
        <div className="section">
          <h3 className="section-title">Folders</h3>
          <div className="folder-list">
            {data.folders.map((folder) => (
              <div
                key={folder}
                className="folder-item"
                onClick={() => onNavigate(`${path}/${folder}`)}
              >
                <FolderOpen className="folder-icon" />
                <span className="folder-name">{folder}</span>
                <ChevronRight className="nav-arrow" />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {fileGroups.length > 0 && (
        <div className="section">
          <h3 className="section-title">Files</h3>
          <div className="files-grid">
            {fileGroups.map((group, idx) => (
              <FileGroupComponent
                key={idx}
                group={group}
                folderPath={path}
                onOpenFile={onOpenFile}
              />
            ))}
          </div>
        </div>
      )}
      
      {data.folders.length === 0 && data.files.length === 0 && (
        <div className="empty-state">
          <Folder className="empty-icon" />
          <p>Nothing here yet 🌵</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [forwardHistory, setForwardHistory] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  
  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const selectRootFolder = async () => {
    try {
      const path = await invoke<string>('select_folder');
      setRootPath(path);
      setCurrentPath(path);
      setPathHistory([path]);
      setForwardHistory([]);
    } catch (err) {
      console.error('Failed to select folder:', err);
    }
  };
  
  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
    setPathHistory([...pathHistory, path]);
    setForwardHistory([]); // Clear forward history when navigating normally
  };
  
  const navigateBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1);
      const currentPathValue = pathHistory[pathHistory.length - 1];
      
      setPathHistory(newHistory);
      setCurrentPath(newHistory[newHistory.length - 1]);
      setForwardHistory([currentPathValue, ...forwardHistory]); // Add to forward history
    }
  };
  
  const navigateForward = () => {
    if (forwardHistory.length > 0) {
      const nextPath = forwardHistory[0];
      const newForwardHistory = forwardHistory.slice(1);
      
      setPathHistory([...pathHistory, nextPath]);
      setCurrentPath(nextPath);
      setForwardHistory(newForwardHistory);
    }
  };
  
  // Mouse button support for back/forward
  useEffect(() => {
    const handleMouseButton = (e: MouseEvent) => {
      // Standard mouse buttons (button 3 = back, button 4 = forward)
      if (e.button === 3) {
        e.preventDefault();
        navigateBack();
      } else if (e.button === 4) {
        e.preventDefault();
        navigateForward();
      }
    };
    
    window.addEventListener('mousedown', handleMouseButton);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseButton);
    };
  }, [pathHistory, forwardHistory]);
  
  const goHome = () => {
    if (rootPath) {
      setCurrentPath(rootPath);
      setPathHistory([rootPath]);
    }
  };
  
  const openFile = async (filePath: string) => {
    try {
      await invoke('open_file', { path: filePath });
    } catch (err) {
      console.error('Failed to open file:', err);
      alert(`Failed to open file: ${err}`);
    }
  };
  
  const getDisplayPath = () => {
    if (!currentPath || !rootPath) return '';
    if (currentPath === rootPath) return '/';
    return currentPath.replace(rootPath, '');
  };
  
  return (
    <div className="app">
      <div className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="header-left">
            <Layers className="app-icon" />
            <h1 className="app-title">File Grouper</h1>
          </div>
          
          <button onClick={selectRootFolder} className="btn-primary">
            {rootPath ? 'Change Folder' : 'Open Folder'}
          </button>
        </div>
      </div>
      
      {currentPath && (
        <div className="navbar">
          <div className="navbar-content">
            <div className="nav-buttons">
              <button onClick={goHome} className="nav-btn" title="Go to root">
                <Home className="nav-icon" />
              </button>
              
              {pathHistory.length > 1 && (
                <button onClick={navigateBack} className="nav-btn" title="Go back">
                  <ArrowLeft className="nav-icon" />
                </button>
              )}
            </div>
            
            <div className="breadcrumb">
              {getDisplayPath() || '/'}
            </div>
          </div>
        </div>
      )}
      
      <div className="main-content">
        {!currentPath ? (
          <div className="welcome">
            <Folder className="welcome-icon" />
            <h2>Welcome to File Grouper</h2>
            <p>Organize and view your files by common patterns</p>
            <button onClick={selectRootFolder} className="btn-large">
              Open Folder
            </button>
          </div>
        ) : (
          <FolderView
            path={currentPath}
            onNavigate={navigateToFolder}
            onOpenFile={openFile}
          />
        )}
      </div>
    </div>
  );
}