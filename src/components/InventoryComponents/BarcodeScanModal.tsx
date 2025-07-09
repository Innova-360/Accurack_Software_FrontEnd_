import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

interface BarcodeScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

const BarcodeScanModal: React.FC<BarcodeScanModalProps> = ({
  isOpen,
  onClose,
  onBarcodeScanned,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [error, setError] = useState<string>("");
  const [manualBarcode, setManualBarcode] = useState("");
  const scanTimeoutRef = useRef<any>(null);

  // Remove ZXing code reader initialization
  useEffect(() => {
    if (!isOpen) {
      // Ensure camera is stopped when modal closes
      stopCamera();
      return;
    }
    setError("");
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Get available cameras
  const getCameraDevices = async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      tempStream.getTracks().forEach((track) => track.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        const backCamera = videoDevices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("environment")
        );
        const preferredDevice = backCamera || videoDevices[0];
        setSelectedDevice(preferredDevice.deviceId);
      }
    } catch (err) {
      setError("Failed to access camera devices");
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        if (videoDevices.length > 0) {
          setDevices(videoDevices);
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch {}
    }
  };

  // Start camera stream
  const startCamera = async (deviceId?: string) => {
    try {
      setError("");
      setHasPermission(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : { ideal: "environment" },
          frameRate: { ideal: 30 },
        },
        audio: false,
      };
      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.addEventListener(
          "loadedmetadata",
          () => {
            const track = mediaStream.getVideoTracks()[0];
            if (track) {
              const capabilities = track.getCapabilities();
              setTorchSupported("torch" in capabilities);
            }
          },
          { once: true }
        );
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setHasPermission(false);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera permission denied. Please allow camera access.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Please connect a camera.");
        } else if (err.name === "NotSupportedError") {
          setError("Camera not supported by this browser.");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError("Camera access failed");
      }
    }
  };

  // const controls = await codeReader.decodeFromVideoDevice(
  //   null,
  //   videoRef.current!,
  //   (result: import("@zxing/library").Result | undefined, err: unknown) => {
  //     if (result) onDetected(result.getText());
  //   }
  // );
  // scanControlsRef.current = controls;

  // const stopCamera = () => {
  //   if (scanControlsRef.current) {
  //     scanControlsRef.current.stop(); // Cleanly stops decoding and releases camera
  //     scanControlsRef.current = null;
  //   }

  //   if (stream) {
  //     stream.getTracks().forEach((track) => track.stop());
  //     setStream(null);
  //   }

  //   setIsScanning(false);
  //   setScanSuccess(false);
  //   setError("");

  //   if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
  // };

  // Stop camera stream
  const stopCamera = () => {
    // Stop the code reader first
    if (codeReaderRef.current) {
      try {
        (codeReaderRef.current as any).reset?.();
        codeReaderRef.current = null;
      } catch (error) {
        console.log("Error stopping code reader:", error);
      }
    }
    
    // Stop all media tracks
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (error) {
          console.log("Error stopping track:", error);
        }
      });
      setStream(null);
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Reset state
    setIsScanning(false);
    setScanSuccess(false);
    setError("");
    setHasPermission(null);
    
    // Clear timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  };

  // Toggle torch
  const toggleTorch = async () => {
    if (stream && torchSupported) {
      try {
        const track = stream.getVideoTracks()[0];
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled } as any],
        });
        setTorchEnabled(!torchEnabled);
      } catch {}
    }
  };

  // Start scanning with ZXing
  const startScanning = async () => {
    if (!videoRef.current || isScanning) return;
    setIsScanning(true);
    setError("");
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);

    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const codeReader = codeReaderRef.current;
      await codeReader.decodeFromVideoDevice(
        selectedDevice || undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
            setScanSuccess(true);
            playBeepSound();
            
            // Stop scanning immediately
            setIsScanning(false);
            
            // Stop the camera and close modal after a short delay
            setTimeout(() => {
              setScanSuccess(false);
              // Stop camera first
              stopCamera();
              console.log("Detected barcode:", result.getText()); // Log the detected barcode
              onBarcodeScanned(result.getText());
              // Close modal after camera is stopped
              setTimeout(() => {
                onClose();
              }, 100);
            }, 1000);
          } else if (err && !(err instanceof NotFoundException)) {
            setError("Barcode scan error: " + err);
          }
        }
      );

      scanTimeoutRef.current = setTimeout(() => {
        setError(
          "No barcode detected. Try adjusting the barcode position or lighting."
        );
        if (codeReaderRef.current) {
          // codeReaderRef.current.reset();
          (codeReaderRef.current as any).reset?.();
        }
        setIsScanning(false);
      }, 30000);
    } catch (err) {
      setError("Failed to start scanning");
      setIsScanning(false);
    }
  };

  // Play beep sound on successful scan
  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "square";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch {}
  };

  // Effects
  useEffect(() => {
    if (!isOpen) return;
    getCameraDevices();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedDevice && hasPermission !== false) {
      startCamera(selectedDevice);
    } else if (!isOpen) {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedDevice]);

  useEffect(() => {
    if (
      isOpen &&
      stream &&
      videoRef.current &&
      hasPermission === true &&
      !isScanning
    ) {
      const video = videoRef.current;
      const onLoadedData = () => {
        setTimeout(startScanning, 1000);
      };
      if (video.readyState >= 2) {
        setTimeout(startScanning, 500);
      } else {
        video.addEventListener("loadeddata", onLoadedData, { once: true });
        return () => video.removeEventListener("loadeddata", onLoadedData);
      }
    } else if (!isOpen && isScanning) {
      setIsScanning(false);
      setScanSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, stream, hasPermission]);

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onBarcodeScanned(manualBarcode.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setManualBarcode("");
    setError("");
    setTorchEnabled(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 modal-overlay" onClick={handleClose} />
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 m-4 w-full max-w-md animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#0f4d57]">Scan Barcode</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="space-y-4">
          {/* Camera selector */}
          {devices.length > 1 && (
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm mb-2"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
          )}
          {/* Video preview and overlays */}
          <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Scanning frame overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative w-full h-full">
                <div
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-2/4 min-w-[300px] h-40 border-2 rounded-lg transition-all duration-300 ${
                    scanSuccess
                      ? "border-green-400 shadow-lg shadow-green-500/50"
                      : isScanning
                        ? "border-blue-400 shadow-lg shadow-blue-500/50"
                        : "border-white"
                  }`}
                >
                  {/* Corner indicators */}
                  <div
                    className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 transition-colors duration-300 ${
                      scanSuccess
                        ? "border-green-400"
                        : isScanning
                          ? "border-blue-400 animate-pulse"
                          : "border-blue-500"
                    }`}
                  ></div>
                  <div
                    className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 transition-colors duration-300 ${
                      scanSuccess
                        ? "border-green-400"
                        : isScanning
                          ? "border-blue-400 animate-pulse"
                          : "border-blue-500"
                    }`}
                  ></div>
                  <div
                    className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 transition-colors duration-300 ${
                      scanSuccess
                        ? "border-green-400"
                        : isScanning
                          ? "border-blue-400 animate-pulse"
                          : "border-blue-500"
                    }`}
                  ></div>
                  <div
                    className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 transition-colors duration-300 ${
                      scanSuccess
                        ? "border-green-400"
                        : isScanning
                          ? "border-blue-400 animate-pulse"
                          : "border-blue-500"
                    }`}
                  ></div>
                  {/* Scanning line */}
                  {isScanning && !scanSuccess && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
                  )}
                  {/* Center target */}
                  <div
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full transition-colors duration-300 ${
                      scanSuccess
                        ? "border-green-400 bg-green-400"
                        : isScanning
                          ? "border-blue-400 animate-ping"
                          : "border-blue-500"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
            {/* Scanning indicator */}
            {isScanning && !scanSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="bg-white/95 px-6 py-4 rounded-lg text-center shadow-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Scanning for barcodes...
                  </p>
                  <p className="text-xs text-gray-600">
                    Position barcode within the frame
                  </p>
                </div>
              </div>
            )}
            {/* Success indicator */}
            {scanSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                <div className="bg-green-500 text-white px-8 py-6 rounded-lg text-center shadow-lg">
                  <div className="text-4xl mb-2">✓</div>
                  <p className="text-lg font-semibold mb-1">
                    Barcode Detected!
                  </p>
                  <p className="text-sm opacity-90">Processing result...</p>
                </div>
              </div>
            )}
            {/* Error display */}
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            {/* Permission denied */}
            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
                <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm">
                  <div className="text-4xl mb-4">📷</div>
                  <h3 className="text-lg font-semibold mb-2">
                    Camera Access Required
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Please enable camera access to scan barcodes
                  </p>
                  <button
                    onClick={() => startCamera(selectedDevice)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enable Camera
                  </button>
                </div>
              </div>
            )}
            {/* Loading state */}
            {hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Initializing camera...</p>
                </div>
              </div>
            )}
            {/* Torch button */}
            {torchSupported && (
              <button
                onClick={toggleTorch}
                className={`absolute top-4 right-4 p-3 rounded-full ${
                  torchEnabled ? "bg-yellow-500" : "bg-black/50"
                } text-white transition-colors`}
                title={
                  torchEnabled ? "Turn off flashlight" : "Turn on flashlight"
                }
              >
                🔦
              </button>
            )}
          </div>
          {/* Manual Barcode Entry */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Or Enter Barcode Manually
            </h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d57] focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleManualSubmit();
                  }
                }}
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualBarcode.trim()}
                className="px-4 py-2 bg-[#0f4d57] text-white rounded-lg hover:bg-[#0d3e47] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BarcodeScanModal;