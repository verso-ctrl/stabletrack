// Mobile utilities for Capacitor integration
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Check if app is running on a native mobile platform
 */
export function isMobile(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform (ios, android, web)
 */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}

/**
 * Take a photo using the device camera
 */
export async function takePhoto(): Promise<string | null> {
  try {
    if (!isMobile()) {
      console.warn('Camera is only available on mobile devices');
      return null;
    }

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    return photo.webPath || null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
}

/**
 * Pick a photo from the device gallery
 */
export async function pickPhoto(): Promise<string | null> {
  try {
    if (!isMobile()) {
      console.warn('Photo picker is only available on mobile devices');
      return null;
    }

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    return photo.webPath || null;
  } catch (error) {
    console.error('Error picking photo:', error);
    return null;
  }
}

/**
 * Save a file to the device filesystem
 */
export async function saveFile(
  fileName: string,
  data: string,
  directory: Directory = Directory.Documents
): Promise<boolean> {
  try {
    if (!isMobile()) {
      console.warn('Filesystem is only available on mobile devices');
      return false;
    }

    await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: directory,
    });

    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    return false;
  }
}

/**
 * Share content using the native share dialog
 */
export async function shareContent(
  title: string,
  text: string,
  url?: string
): Promise<boolean> {
  try {
    if (!isMobile()) {
      // Fallback to Web Share API
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return true;
      }
      console.warn('Share is not available');
      return false;
    }

    await Share.share({
      title,
      text,
      url,
    });

    return true;
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
}

/**
 * Trigger haptic feedback
 */
export async function hapticImpact(style: ImpactStyle = ImpactStyle.Medium): Promise<void> {
  try {
    if (!isMobile()) return;
    await Haptics.impact({ style });
  } catch (error) {
    console.error('Error triggering haptic:', error);
  }
}

/**
 * Configure the status bar
 */
export async function configureStatusBar(
  style: Style = Style.Light,
  backgroundColor?: string
): Promise<void> {
  try {
    if (!isMobile()) return;

    await StatusBar.setStyle({ style });

    if (backgroundColor && getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: backgroundColor });
    }
  } catch (error) {
    console.error('Error configuring status bar:', error);
  }
}

/**
 * Hide the splash screen
 */
export async function hideSplashScreen(): Promise<void> {
  try {
    if (!isMobile()) return;
    await SplashScreen.hide();
  } catch (error) {
    console.error('Error hiding splash screen:', error);
  }
}

/**
 * Show the splash screen
 */
export async function showSplashScreen(): Promise<void> {
  try {
    if (!isMobile()) return;
    await SplashScreen.show();
  } catch (error) {
    console.error('Error showing splash screen:', error);
  }
}
