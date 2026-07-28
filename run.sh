#!/bin/bash

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Stopping servers and services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    if [ ! -z "$OLLAMA_SPAWNED_PID" ]; then
        kill $OLLAMA_SPAWNED_PID 2>/dev/null
    fi
    exit 0
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Check if Ollama is installed
if command -v ollama >/dev/null 2>&1; then
    echo "Checking Ollama service..."
    if ! curl -s http://localhost:11434 >/dev/null; then
        echo "Ollama is not running. Starting local Ollama service..."
        ollama serve >/dev/null 2>&1 &
        OLLAMA_SPAWNED_PID=$!
        # Wait for Ollama to boot
        for i in {1..10}; do
            if curl -s http://localhost:11434 >/dev/null; then
                break
            fi
            sleep 1
        done
    fi

    # Ensure default model is available
    if curl -s http://localhost:11434 >/dev/null; then
        if ! ollama list | grep -q -E "qwen(3|2.5)"; then
            echo "Default AI model not found. Pulling qwen2.5:1.5b..."
            ollama pull qwen2.5:1.5b
        else
            echo "Ollama models are ready."
        fi
    else
        echo "Warning: Failed to launch Ollama service."
    fi
else
    echo "Ollama is not installed on your system. Visit https://ollama.com to install it for offline AI support."
fi

echo "Starting Flask Backend on port 5001..."
.venv/bin/python app.py &
BACKEND_PID=$!

echo "Starting Vite Frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait for background processes to finish
wait $BACKEND_PID $FRONTEND_PID
