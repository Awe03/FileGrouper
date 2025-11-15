use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct DirContents {
    folders: Vec<String>,
    files: Vec<String>,
}

#[tauri::command]
async fn select_folder() -> Result<String, String> {
    let dialog = rfd::FileDialog::new().set_title("Select Parent Folder");
    
    let folder = dialog.pick_folder();
    
    match folder {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("No folder selected".to_string()),
    }
}

#[tauri::command]
async fn read_directory(path: String) -> Result<DirContents, String> {
    let dir_path = PathBuf::from(&path);
    
    if !dir_path.exists() {
        return Err("Path does not exist".to_string());
    }
    
    if !dir_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    
    let mut folders = Vec::new();
    let mut files = Vec::new();
    
    match fs::read_dir(&dir_path) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    let name = entry.file_name().to_string_lossy().to_string();
                    
                    if path.is_dir() {
                        folders.push(name);
                    } else if path.is_file() {
                        files.push(name);
                    }
                }
            }
        }
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    }
    
    folders.sort();
    files.sort();
    
    Ok(DirContents { folders, files })
}

#[tauri::command]
async fn open_file(path: String) -> Result<(), String> {
    use std::process::Command;
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(&["/C", "start", "", &path])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            select_folder,
            read_directory,
            open_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}