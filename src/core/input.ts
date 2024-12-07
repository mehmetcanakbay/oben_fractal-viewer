// Input holds as snapshot of input state
export default interface Input {
    // Analog input (e.g mouse, touchscreen)
    readonly analog: {
      readonly x: number;
      readonly y: number;
      readonly panX: number;
      readonly panY: number;
      readonly rotationOffsetX: number;
      readonly rotationOffsetY: number;
      readonly zoom: number;
      readonly touching: boolean;
    };
  }
  
  // InputHandler is a function that when called, returns the current Input state.
  export type InputHandler = () => Input;
  
  // createInputHandler returns an InputHandler by attaching event handlers to the window and canvas.
  export function createInputHandler(
    canvas: HTMLCanvasElement
  ): InputHandler {
    const digital = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
    };
    const analog = {
      x: 0,
      y: 0,
      panX: 0,
      panY: 0,
      zoom: 0,
      rotationOffsetX: 0, 
      rotationOffsetY: 0, 
    };
    let mouseDown = false;
    let panning = false;
    let axisRotationEnabled = false;

    canvas.style.touchAction = 'pinch-zoom';
    canvas.addEventListener('pointerdown', (e) => {
      if (e.buttons & 1) mouseDown = true;
      if (e.buttons & 4) panning = true;
      if (e.button === 2) {axisRotationEnabled = true;e.preventDefault();e.stopImmediatePropagation();}
    });

    canvas.addEventListener('pointerup', (e) => {
      // console.log(e)
      if (e.buttons & 1) mouseDown = false;
      if (e.button === 1) panning = false;
      if (e.button === 2) {axisRotationEnabled = false;e.preventDefault();e.stopImmediatePropagation();}
    });

    canvas.addEventListener('pointermove', (e) => {
      mouseDown = e.pointerType == 'mouse' ? (e.buttons & 1) !== 0 : true;
      if (mouseDown) {
        analog.x += e.movementX;
        analog.y += e.movementY;
        return;
      }

      if (panning) {
        analog.panX -= e.movementX;
        analog.panY += e.movementY;
        return;
      }

      if (axisRotationEnabled) {
        analog.rotationOffsetX += e.movementX;
        analog.rotationOffsetY += e.movementY;
        return;
      }
    });

    canvas.addEventListener(
      'wheel',
      (e) => {
        mouseDown = (e.buttons & 1) !== 0;
        // if (mouseDown) {
          // The scroll value varies substantially between user agents / browsers.
          // Just use the sign.
          analog.zoom += Math.sign(e.deltaY);
          e.preventDefault();
          e.stopPropagation();
        // }
      },
      { passive: false }
    );

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // Prevent the context menu from appearing
    });
  
    return () => {
      const out = {
        digital,
        analog: {
          x: analog.x,
          y: analog.y,
          panX: analog.panX,
          panY: analog.panY,
          rotationOffsetX: analog.rotationOffsetX,
          rotationOffsetY: analog.rotationOffsetY,
          zoom: analog.zoom,
          touching: mouseDown,
        },
      };
      // Clear the analog values, as these accumulate.
      analog.x = 0;
      analog.y = 0;
      analog.zoom = 0;
      analog.panX = 0;
      analog.panY = 0;
      analog.rotationOffsetX = 0;
      analog.rotationOffsetY = 0;
      return out;
    };
  }
  