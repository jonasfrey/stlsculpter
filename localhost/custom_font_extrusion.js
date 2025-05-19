

async function() {

    
  // 1. Load your custom font
  const fontLoader = new FontLoader();
  async function loadFontAsync(url) {
      const loader = new FontLoader();
      
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (font) => resolve(font),
          undefined, // Progress callback (optional)
          (error) => reject(error)
        );
      });
    }
        // 1. Load font asynchronously
  const font = await loadFontAsync('./Manuskript Gothisch_Regular.json');
  
  let n_size = 20;
  let n_extr = 2;
  let n_curve_segments = 24;
  // 2. Create text geometry
  const textGeometry = new THREE.TextGeometry('Hello Three.js!', {
    font: font,
    size: n_size,
    height:n_extr,
    curveSegments: n_curve_segments,
    bevelEnabled: true,
    bevelThickness: n_extr/5,
    bevelSize: 0.02,
    bevelSegments: 5
  });
  
  // 3. Center the geometry
  textGeometry.computeBoundingBox();
  const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
  textGeometry.translate(-textWidth / 2, 0, 0);
  
  // 4. Create material and mesh
  const textMesh = f_o_shaded_mesh(textGeometry);
  return [
      textMesh
  ]
  
  

}