use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri_plugin_dialog::DialogExt;

const VIDEO_EXTENSIONS: &[&str] = &["mp4", "mkv", "mov", "avi", "webm", "m4v"];

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoFile {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub size_human: String,
}

fn human_size(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
    let mut size = bytes as f64;
    let mut unit = 0;
    while size >= 1024.0 && unit < UNITS.len() - 1 {
        size /= 1024.0;
        unit += 1;
    }
    format!("{:.1} {}", size, UNITS[unit])
}

#[tauri::command]
async fn select_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = app
        .dialog()
        .file()
        .blocking_pick_folder();

    Ok(path.map(|p| p.to_string()))
}

#[tauri::command]
async fn scan_videos(folder: String) -> Result<Vec<VideoFile>, String> {
    let mut videos = Vec::new();
    scan_dir(Path::new(&folder), &mut videos);
    Ok(videos)
}

fn scan_dir(dir: &Path, videos: &mut Vec<VideoFile>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            scan_dir(&path, videos);
        } else if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            if VIDEO_EXTENSIONS.contains(&ext.to_lowercase().as_str()) {
                if let Ok(meta) = entry.metadata() {
                    let size = meta.len();
                    videos.push(VideoFile {
                        path: path.to_string_lossy().into_owned(),
                        name: path
                            .file_name()
                            .unwrap_or_default()
                            .to_string_lossy()
                            .into_owned(),
                        size,
                        size_human: human_size(size),
                    });
                }
            }
        }
    }
}

#[tauri::command]
async fn get_video_metadata(path: String) -> Result<VideoFile, String> {
    let p = Path::new(&path);
    let meta = std::fs::metadata(p).map_err(|e| e.to_string())?;
    let size = meta.len();
    Ok(VideoFile {
        path: path.clone(),
        name: p
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        size,
        size_human: human_size(size),
    })
}

#[tauri::command]
async fn reveal_file(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .args(["-R", &path])
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer")
        .args(["/select,", &path])
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    {
        let folder = Path::new(&path)
            .parent()
            .unwrap_or(Path::new("/"))
            .to_string_lossy()
            .into_owned();
        std::process::Command::new("xdg-open")
            .arg(&folder)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
async fn open_folder(path: String) -> Result<(), String> {
    let folder = Path::new(&path)
        .parent()
        .unwrap_or(Path::new(&path))
        .to_string_lossy()
        .into_owned();

    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .arg(&folder)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer")
        .arg(&folder)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(&folder)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            select_folder,
            scan_videos,
            get_video_metadata,
            reveal_file,
            open_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
