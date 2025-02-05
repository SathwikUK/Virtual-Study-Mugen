import React, { useRef, useState, useEffect } from "react";

const fabric = window.fabric;


import {
  FaPencilAlt,
  FaEraser,
  FaTextHeight,
  FaSquare,
  FaUndo,
  FaRedo,
  FaSave,
  FaDownload,
  FaCircle,
  FaMousePointer,
  FaImage,
} from "react-icons/fa";

const Whiteboard = ({ selectedChat }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [mode, setMode] = useState("select"); // Default mode
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#fff",
      width: canvasRef.current?.parentElement?.offsetWidth || 700,
      height: canvasRef.current?.parentElement?.offsetHeight || 400,
    });
    setCanvas(fabricCanvas);

    const handleResize = () => {
      if (canvasRef.current) {
        fabricCanvas.setWidth(canvasRef.current.parentElement.offsetWidth);
        fabricCanvas.setHeight(canvasRef.current.parentElement.offsetHeight);
        fabricCanvas.renderAll();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      fabricCanvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;

    // Reset canvas modes
    canvas.isDrawingMode = false;
    canvas.selection = mode === "select";

    if (mode === "draw") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#000";
      canvas.freeDrawingBrush.width = 2;
    }

    if (mode === "erase") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
      canvas.freeDrawingBrush.width = 20;
    }

    if (mode === "text") {
      const text = new fabric.IText("Click to edit text", {
        left: 50,
        top: 50,
        fontSize: 20,
      });
      canvas.add(text);
      setMode("select"); // Revert to selection mode after adding text
    }

    if (mode === "shape") {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: "blue",
        width: 50,
        height: 50,
      });
      canvas.add(rect);
      setMode("select"); // Revert to selection mode after adding shape
    }

    if (mode === "circle") {
      const circle = new fabric.Circle({
        left: 150,
        top: 150,
        radius: 30,
        fill: "red",
      });
      canvas.add(circle);
      setMode("select"); // Revert to selection mode after adding circle
    }

    if (mode === "image") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (img) => {
              img.scaleToWidth(200);
              img.scaleToHeight(200);
              canvas.add(img);
            });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      setMode("select"); // Revert to selection mode after adding image
    }
  }, [mode, canvas]);

  const saveHistory = () => {
    if (canvas) {
      setHistory((prev) => [...prev, canvas.toJSON()]);
      setRedoStack([]); // Clear redo stack on new action
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const lastState = history[history.length - 2];
      canvas.loadFromJSON(lastState, () => canvas.renderAll());
      setRedoStack((prev) => [history.pop(), ...prev]);
      setHistory([...history]);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.shift();
      canvas.loadFromJSON(nextState, () => canvas.renderAll());
      setHistory((prev) => [...prev, nextState]);
      setRedoStack([...redoStack]);
    }
  };

  const handleSave = () => {
    const jsonData = JSON.stringify(canvas.toJSON());
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "whiteboard.json";
    link.click();
  };

  const handleExport = () => {
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "whiteboard.png";
    link.click();
  };

  return (
   <div className="whiteboard-container flex flex-col h-full p-4">
  {/* Header Section */}
  <div className="header flex flex-col items-center mb-2">
    <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
      Whiteboard for {selectedChat?.name || "Group"}
    </h2>

    {/* Toolbar */}
    <div className="toolbar h-10 flex gap-4 justify-start bg-gray-800 p-2 rounded shadow-md w-full max-w-4xl">
      {[
        { mode: "select", icon: <FaMousePointer /> },
        { mode: "draw", icon: <FaPencilAlt /> },
        { mode: "erase", icon: <FaEraser /> },
        { mode: "text", icon: <FaTextHeight /> },
        { mode: "shape", icon: <FaSquare /> },
        { mode: "circle", icon: <FaCircle /> },
        { mode: "image", icon: <FaImage /> },
      ].map((tool) => (
        <button
          key={tool.mode}
          onClick={() => setMode(tool.mode)}
          className={`btn p-2 rounded-full text-white ${
            mode === tool.mode ? "bg-purple-500" : "bg-gray-700"
          }`}
        >
          {tool.icon}
        </button>
      ))}
      <button
        onClick={handleUndo}
        className="btn p-2 rounded-full text-white bg-gray-700"
      >
        <FaUndo />
      </button>
      <button
        onClick={handleRedo}
        className="btn p-2 rounded-full text-white bg-gray-700"
      >
        <FaRedo />
      </button>
      <button
        onClick={handleSave}
        className="btn p-2 rounded-full text-white bg-gray-700"
      >
        <FaSave />
      </button>
      <button
        onClick={handleExport}
        className="btn p-2 rounded-full text-white bg-gray-700"
      >
        <FaDownload />
      </button>
    </div>
  </div>

  {/* Canvas Section */}
  <div className="flex-grow flex justify-center items-center mt-4">
    <canvas
      ref={canvasRef}
      className="canvas border border-gray-300 bg-white shadow-lg rounded w-full max-w-4xl"
    />
  </div>
</div>

  );
};

export default Whiteboard;