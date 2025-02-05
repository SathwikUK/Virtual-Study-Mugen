import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  FaPencilAlt,
  FaEraser,
  FaSquare,
  FaCircle,
  FaFont,
  FaUndo,
  FaRedo,
  FaDownload,
  FaSave,
  FaImage,
  FaMousePointer,
  FaTrash,
} from "react-icons/fa";

// Initialize socket connection
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Get fabric from window object
const fabric = window.fabric;

const Whiteboard = ({ selectedChat }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [drawingMode, setDrawingMode] = useState("pencil");
  const [history, setHistory] = useState([null]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentLineWidth, setCurrentLineWidth] = useState(2);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const newCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: window.innerWidth * 0.7,
      height: window.innerHeight * 0.8,
      backgroundColor: "white",
    });

    setCanvas(newCanvas);

    const handleResize = () => {
      newCanvas.setDimensions({
        width: window.innerWidth * 0.7,
        height: window.innerHeight * 0.8,
      });
    };
    window.addEventListener("resize", handleResize);

    socket.on("whiteboard-updated", (data) => {
      newCanvas.loadFromJSON(data, () => {
        newCanvas.renderAll();
      });
    });

    return () => {
      newCanvas.dispose();
      window.removeEventListener("resize", handleResize);
      socket.off("whiteboard-updated");
    };
  }, []);

  // Handle drawing mode changes
  useEffect(() => {
    if (!canvas) return;

    canvas.isDrawingMode = drawingMode === "pencil" || drawingMode === "eraser";

    if (drawingMode === "pencil") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = currentLineWidth;
      canvas.freeDrawingBrush.color = currentColor;
    } else if (drawingMode === "eraser") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = currentLineWidth * 10;
      canvas.freeDrawingBrush.color = canvas.backgroundColor;
    }

    canvas.on("object:added", saveState);
    canvas.on("object:modified", saveState);
    canvas.on("object:removed", saveState);
    canvas.on("selection:cleared", saveState);

    return () => {
      canvas.off("object:added", saveState);
      canvas.off("object:modified", saveState);
      canvas.off("object:removed", saveState);
      canvas.off("selection:cleared", saveState);
    };
  }, [canvas, drawingMode, currentColor, currentLineWidth]);

  // Save canvas state
  const saveState = () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    const updatedHistory = [...history.slice(0, historyIndex + 1), json];
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    socket.emit("whiteboard-update", {
      roomId: selectedChat._id,
      data: json,
    });
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        socket.emit("whiteboard-update", {
          roomId: selectedChat._id,
          data: history[newIndex],
        });
      });
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        socket.emit("whiteboard-update", {
          roomId: selectedChat._id,
          data: history[newIndex],
        });
      });
    }
  };

  // Add shapes
  const addShape = (type) => {
    let shape;
    if (type === "rectangle") {
      shape = new fabric.Rect({
        left: 100,
        top: 100,
        fill: currentColor,
        width: 60,
        height: 60,
      });
    } else if (type === "circle") {
      shape = new fabric.Circle({
        left: 100,
        top: 100,
        fill: currentColor,
        radius: 30,
      });
    }
    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
    }
  };

  // Add text
  const addText = () => {
    const text = new fabric.IText("Click to edit", {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: currentColor,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        fabric.Image.fromURL(f.target.result, (img) => {
          img.scaleToWidth(200);
          canvas.add(img);
          canvas.setActiveObject(img);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Download canvas
  const downloadCanvas = () => {
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
    });
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = dataUrl;
    link.click();
  };

  // Save canvas
  const saveCanvas = () => {
    const json = canvas.toJSON();
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = "whiteboard.json";
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // Handle delete
  const handleDelete = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        saveState();
      }
    }
  };

  // Handle line width change
  const handleLineWidthChange = (e) => {
    setCurrentLineWidth(parseInt(e.target.value, 10));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="toolbar flex gap-2 mb-4 p-2 bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => setDrawingMode("select")}
          className={`p-2 rounded hover:bg-blue-600 hover:shadow-lg transition-colors duration-200 ${
            drawingMode === "select" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <FaMousePointer className="text-xl" />
        </button>
        <button
          onClick={() => setDrawingMode("pencil")}
          className={`p-2 rounded hover:bg-blue-600 hover:shadow-lg transition-colors duration-200 ${
            drawingMode === "pencil" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <FaPencilAlt className="text-xl" />
        </button>
        <button
          onClick={() => setDrawingMode("eraser")}
          className={`p-2 rounded hover:bg-red-600 hover:shadow-lg transition-colors duration-200 ${
            drawingMode === "eraser" ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          <FaEraser className="text-xl" />
        </button>
        <button
          onClick={() => addShape("rectangle")}
          className="p-2 rounded hover:bg-green-600 hover:shadow-lg transition-colors duration-200 bg-gray-200"
        >
          <FaSquare className="text-xl" />
        </button>
        <button
          onClick={() => addShape("circle")}
          className="p-2 rounded hover:bg-green-600 hover:shadow-lg transition-colors duration-200 bg-gray-200"
        >
          <FaCircle className="text-xl" />
        </button>
        <button
          onClick={addText}
          className="p-2 rounded hover:bg-yellow-600 hover:shadow-lg transition-colors duration-200 bg-gray-200"
        >
          <FaFont className="text-xl" />
        </button>
        <label className="p-2 rounded hover:bg-purple-600 hover:shadow-lg transition-colors duration-200 bg-gray-200 cursor-pointer">
          <FaImage className="text-xl" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
        <button
          onClick={handleUndo}
          className={`p-2 rounded hover:bg-gray-400 hover:shadow-lg transition-colors duration-200 bg-gray-200 ${
            historyIndex <= 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={historyIndex <= 0}
        >
          <FaUndo className="text-xl" />
        </button>
        <button
          onClick={handleRedo}
          className={`p-2 rounded hover:bg-gray-400 hover:shadow-lg transition-colors duration-200 bg-gray-200 ${
            historyIndex >= history.length - 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={historyIndex >= history.length - 1}
        >
          <FaRedo className="text-xl" />
        </button>
        <button
          onClick={downloadCanvas}
          className="p-2 rounded hover:bg-indigo-600 hover:shadow-lg transition-colors duration-200 bg-gray-200"
        >
          <FaDownload className="text-xl" />
        </button>
        <button
          onClick={saveCanvas}
          className="p-2 rounded hover:bg-indigo-600 hover:shadow-lg transition-colors duration-200 bg-gray-200"
        >
          <FaSave className="text-xl" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded hover:bg-red-600 hover:shadow-lg transition-colors duration-200 bg-gray-200"
        >
          <FaTrash className="text-xl" />
        </button>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className="p-1 rounded"
        />
        <input
          type="range"
          min="1"
          max="10"
          value={currentLineWidth}
          onChange={handleLineWidthChange}
          className="w-24"
        />
      </div>
      <div className="flex-1 border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default Whiteboard;