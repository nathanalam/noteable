const canvas = document.getElementById('noteCanvas');
const ctx = canvas.getContext('2d', { desynchronized: true });
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

// Set fixed canvas dimensions
canvas.width = 1920;
canvas.height = 1080;

let drawing = false;
let lastX = 0;
let lastY = 0;
let lastPressure = 0.5; // Default pressure

function getCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
        pressure: event.pressure !== 0 ? event.pressure : 0.5 // Use default pressure if not supported
    };
}

function startDrawing(event) {
    // Only handle pen or touch, ignore mouse
    if (event.pointerType === 'mouse') return;
    
    // Ignore palm touches
    if (event.pointerType === 'touch' && event.isPrimary === false) return;

    drawing = true;
    const coords = getCoordinates(event);
    lastX = coords.x;
    lastY = coords.y;
    lastPressure = coords.pressure;
    
    // Start a new path
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    
    event.preventDefault();
}

function stopDrawing(event) {
    if (!drawing) return;
    drawing = false;
    
    // Complete the path
    ctx.stroke();
}

function draw(event) {
    if (!drawing) return;
    
    // Only handle pen or touch, ignore mouse
    if (event.pointerType === 'mouse') return;
    
    // Ignore palm touches
    if (event.pointerType === 'touch' && event.isPrimary === false) return;

    event.preventDefault();
    const coords = getCoordinates(event);
    
    // Calculate line width based on pressure
    // Linear interpolation
    // const minWidth = 0.5;
    // const maxWidth = 5;
    // const lineWidth = minWidth + (maxWidth - minWidth) * coords.pressure;

    // Ease in/out
    const minWidth = 0.5;
    const maxWidth = 20;
    const controlPoint = 0.2; // Adjust this value for different curve shapes
    const t = coords.pressure;
    const lineWidth = minWidth + (maxWidth - minWidth) * ((1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * controlPoint + t * t * 1);


    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'black';

    // Continue the current path
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);

    lastX = coords.x;
    lastY = coords.y;
    lastPressure = coords.pressure;
}

// Remove old event listeners
canvas.removeEventListener('pointerdown', startDrawing);
canvas.removeEventListener('pointermove', draw);
canvas.removeEventListener('pointerup', stopDrawing);
canvas.removeEventListener('pointerout', stopDrawing);
canvas.removeEventListener('pointercancel', stopDrawing);

// Add pointer event listeners
canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointerout', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);

// Enable palm rejection if supported
if (canvas.style.touchAction !== undefined) {
    canvas.style.touchAction = 'none';
}

exportBtn.addEventListener('click', exportNotes);

function exportNotes() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'handwritten_notes.png';
    link.click();
}

importFile.addEventListener('change', importNotes);

function importNotes(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}
