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


    


//     // Center shape mesh in world origin
// shapeGeometry.computeBoundingBox();
// const center = shapeGeometry.boundingBox.getCenter(new THREE.Vector3());
// shapeMesh.position.sub(center);

// // Optionally rotate shape to XZ plane if camera looks down Y axis
// shapeMesh.rotation.x = -Math.PI / 2;

    return [
        axesHelper,
        shapeMesh
]
      

    

            }