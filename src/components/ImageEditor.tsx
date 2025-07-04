import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Image, Rect } from 'fabric';
import { FaDownload, FaSave, FaSquare, FaPalette, FaUndo, FaRedo, FaRegSquare } from 'react-icons/fa';

interface ImageEditorProps {
  stationId: number;
  stationName: string;
  initialImageUrl?: string;
  onSave: (canvas: Canvas) => void;
  onClose: () => void;
}

export default function ImageEditor({ 
  stationId, 
  stationName, 
  initialImageUrl, 
  onSave, 
  onClose 
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInitialized = useRef(false);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState(0);
  const [canvasSize, setCanvasSize] = useState(256);

  useEffect(() => {
    if (canvasRef.current && !canvasInitialized.current) {
      canvasInitialized.current = true;
      
      console.log('Initializing Fabric canvas with size:', canvasSize);
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: canvasSize,
        height: canvasSize,
      });
      
      fabricCanvas.backgroundColor = backgroundColor;
      fabricCanvas.renderAll();
      setCanvas(fabricCanvas);
      
      console.log('Fabric canvas initialized:', fabricCanvas);

      return () => {
        fabricCanvas.dispose();
        canvasInitialized.current = false;
      };
    }
  }, []);

  // Load image after canvas is ready
  useEffect(() => {
    if (canvas && initialImageUrl) {
      console.log('Loading image into canvas:', initialImageUrl);
      
      // Clear the test rectangle first
      canvas.clear();
      canvas.backgroundColor = backgroundColor;
      canvas.renderAll();
      
      // Test if image URL is accessible first
      console.log('Testing image URL accessibility...');
      fetch(initialImageUrl)
        .then(response => {
          console.log('Image URL fetch response:', response.status, response.statusText);
          if (!response.ok) {
            console.error('Image URL not accessible:', response.status, response.statusText);
            return;
          }
          
          // URL is accessible, now try Fabric.js loading
          console.log('Image URL is accessible, trying Fabric.js loading...');
          tryFabricLoading();
        })
        .catch(error => {
          console.error('Image URL fetch failed:', error);
        });
      
      function tryFabricLoading() {
        // Use native HTML Image element first, then convert to Fabric
        console.log('Loading with native Image element first...');
        const nativeImg = document.createElement('img');
        
        nativeImg.onload = () => {
          console.log('Native image loaded successfully, dimensions:', nativeImg.width, 'x', nativeImg.height);
          
          // Now create Fabric Image from the loaded native image
          const fabricImg = new Image(nativeImg, {
            left: 0,
            top: 0,
          });
          
          console.log('Fabric image created from native image:', fabricImg);
          addImageToCanvas(fabricImg);
        };
        
        nativeImg.onerror = (error) => {
          console.error('Native image failed to load:', error);
          
          // Fallback to direct Fabric.js loading
          console.log('Trying direct Fabric.js loading as fallback...');
          Image.fromURL(
            initialImageUrl,
            (img, isError) => {
              if (isError) {
                console.error('Fabric.js direct loading also failed:', isError);
                return;
              }
              console.log('Fabric.js direct loading succeeded:', img);
              addImageToCanvas(img);
            }
          );
        };
        
        // Set crossOrigin BEFORE setting src to avoid tainted canvas
        nativeImg.crossOrigin = 'anonymous';
        nativeImg.src = initialImageUrl;
      }
    }
    
    function addImageToCanvas(img: any) {
      if (img && canvas) {
        // Scale image to fit canvas
        const imgWidth = img.width || 100;
        const imgHeight = img.height || 100;
        console.log('Image dimensions:', imgWidth, 'x', imgHeight);
        const scale = Math.min(canvasSize / imgWidth, canvasSize / imgHeight);
        console.log('Scale factor:', scale);
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvasSize - (imgWidth * scale)) / 2,
          top: (canvasSize - (imgHeight * scale)) / 2,
        });
        
        canvas.add(img);
        canvas.renderAll();
        console.log('Image added to canvas, canvas objects count:', canvas.getObjects().length);
        console.log('Canvas renderAll called');
      }
    }
  }, [canvas, initialImageUrl, backgroundColor, canvasSize]);

  // Update background color
  useEffect(() => {
    if (canvas) {
      canvas.backgroundColor = backgroundColor;
      canvas.renderAll();
    }
  }, [canvas, backgroundColor]);

  const handleMakeSquare = () => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length === 0) return;

    // Get the main image (usually the first object)
    const mainImage = objects.find(obj => obj.type === 'image');
    if (!mainImage) return;

    // Calculate square crop
    const objWidth = mainImage.getScaledWidth();
    const objHeight = mainImage.getScaledHeight();
    const size = Math.min(objWidth, objHeight);

    // Create clipping rectangle
    const clipRect = new Rect({
      left: mainImage.left! + (objWidth - size) / 2,
      top: mainImage.top! + (objHeight - size) / 2,
      width: size,
      height: size,
      fill: 'transparent',
      stroke: 'red',
      strokeDashArray: [5, 5],
      selectable: true,
    });

    canvas.add(clipRect);
    canvas.renderAll();
  };

  const handleAddBorder = () => {
    if (!canvas || borderWidth === 0) return;

    const borderRect = new Rect({
      left: borderWidth / 2,
      top: borderWidth / 2,
      width: canvasSize - borderWidth,
      height: canvasSize - borderWidth,
      fill: 'transparent',
      stroke: borderColor,
      strokeWidth: borderWidth,
      selectable: false,
    });

    canvas.add(borderRect);
    canvas.renderAll();
  };

  const handleResize = (newSize: number) => {
    if (!canvas) return;

    setCanvasSize(newSize);
    canvas.setWidth(newSize);
    canvas.setHeight(newSize);
    canvas.renderAll();
  };

  const handleSave = () => {
    if (canvas) {
      onSave(canvas);
    }
  };

  const handleUndo = () => {
    // Simple undo - remove last added object
    if (canvas) {
      const objects = canvas.getObjects();
      if (objects.length > 1) { // Keep at least the main image
        canvas.remove(objects[objects.length - 1]);
        canvas.renderAll();
      }
    }
  };

  const handleClearAll = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = backgroundColor;
      canvas.renderAll();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Image Editor</h2>
            <p className="text-sm text-gray-600">Editing favicon for: {stationName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-center">
                  <div className="border border-gray-300 bg-white">
                    <canvas ref={canvasRef} />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Canvas Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas Size
                </label>
                <select
                  value={canvasSize}
                  onChange={(e) => handleResize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={64}>64x64</option>
                  <option value={128}>128x128</option>
                  <option value={256}>256x256</option>
                  <option value={512}>512x512</option>
                </select>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPalette className="inline mr-1" />
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Border */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaRegSquare className="inline mr-1" />
                  Border
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-8">{borderWidth}px</span>
                  </div>
                  <button
                    onClick={handleAddBorder}
                    disabled={borderWidth === 0}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Border
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleMakeSquare}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaSquare />
                  Make Square
                </button>
                
                <button
                  onClick={handleUndo}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <FaUndo />
                  Undo Last
                </button>
                
                <button
                  onClick={handleClearAll}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear All
                </button>
              </div>

              {/* Save */}
              <div className="pt-4 border-t">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <FaSave />
                  Save Image
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}