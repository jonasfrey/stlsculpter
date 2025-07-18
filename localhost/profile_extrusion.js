async function() {
    let f_v_load_svg = async function(s_name_file) {
        return new Promise((resolve, reject) => {
            const sVGLoader = new SVGLoader();
            sVGLoader.load(s_name_file, (data) => {
                resolve(data);
            }, undefined, (error) => {
                reject(error);
            });
        })
    }
    let data = await f_v_load_svg('./profile2simplecircle.svg');

    const shapes = [];

    console.log(data);
    // debugger
    data.paths.forEach((path) => {
        const subShapes = path.toShapes(true); // 'true' means all shapes are solid (holes handled)
        shapes.push(...subShapes);
    });

    const shape = shapes[0];
    
    const shapeGeometry = new THREE.ShapeGeometry(shape);
    const shapeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide, // see front and back
    });
    const shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
    
    

    const axesHelper = new THREE.AxesHelper(5); // size = length of axes lines

    const shapetriangle = new THREE.Shape();
    // Example: simple triangle
    shapetriangle.moveTo(0, 0);
    shapetriangle.lineTo(1, 0);
    shapetriangle.lineTo(0.5, 1);
    shapetriangle.lineTo(0, 0);
    
    
    // Define arc in 3D (top-down view, arc in XZ plane)
    const arcRadius = 10;
    const arcPoints = [];
    for (let i = 0; i <= 100; i++) {
        const theta = (Math.PI * i) / 100; // from 0 to PI
        arcPoints.push(new THREE.Vector3(
        Math.sin(theta) * arcRadius,
        Math.cos(theta) * arcRadius,
        0, // Y stays 0 for top view
        ));
    }
    
    const arcCurve3D = new THREE.CatmullRomCurve3(arcPoints);
    
    
// 1. Pfadpunkte aus SVG holen (2D)
const points2D = data.paths[0].subPaths[0].getPoints(); // Array von Vector2

// 2. 2D Punkte in 3D Punkte (Vector3) umwandeln (z.B. X,Y → X,0,Y)
const points3D = points2D.map(p => new THREE.Vector3(p.x, 0, p.y)); // Y als "up" Höhe 0

// 3. Curve aus Punkten erstellen
const extrudePath = new THREE.CatmullRomCurve3(points3D);

// 4. ExtrudeSettings mit dem extrudePath
const extrudeSettings = {
    steps: points3D.length,
    bevelEnabled: false,
    extrudePath: extrudePath
};
    const geometry = new THREE.ExtrudeGeometry(shapetriangle, extrudeSettings);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);


    // Center shape mesh in world origin
shapeGeometry.computeBoundingBox();
const center = shapeGeometry.boundingBox.getCenter(new THREE.Vector3());
shapeMesh.position.sub(center);

// Optionally rotate shape to XZ plane if camera looks down Y axis
shapeMesh.rotation.x = -Math.PI / 2;

    return [
        // mesh,
        axesHelper,
        shapeMesh
]
      

    

            }