async function() {

    // Wrap loader.load in a Promise
async function loadSTLAsync(url) {
    return new Promise((resolve, reject) => {
        loader.load(
            url,
            (geometry) => resolve(geometry),
            (xhr) => {
                // Optional: Progress tracking
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => reject(error)
        );
    });
}

// Load the STL file
const loader = new STLLoader();

    // Replace 'model.stl' with the path to your STL file
    let o_geometry = await loadSTLAsync(
    './arosa_sun.stl', // Path to your STL file
    );
        // Create a material
        const material = new THREE.MeshPhongMaterial({
            color: 0x00aaff,
            specular: 0x111111,
            shininess: 200,
        });

        // Create a mesh from the geometry and material
        const mesh = new THREE.Mesh(o_geometry, material);

        // Compute the bounding box to center the model
        o_geometry.computeBoundingBox();
        const boundingBox = o_geometry.boundingBox;
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        // Center the model
        mesh.position.x = -center.x;
        mesh.position.y = -center.y;
        mesh.position.z = -center.z;

        // o_scene.add(mesh);

    // Get the vertices (positions) from the geometry
    const positions = o_geometry.attributes.position.array;
    
    console.log('vertices:', Array.from(positions)); 
    
    // Optional: Convert to an array of {x, y, z} objects
    const vertices = [];
    for (let i = 0; i < positions.length; i += 3) {
        vertices.push({
            x: positions[i],
            y: positions[i + 1],
            z: positions[i + 2]
        });
    }
    let a_o_p = vertices.filter(o=>{
        return o.z == 25
    });
    // console.log(a_o_p)

    // Step 1: Use a Set to remove duplicates
    const uniqueVertices = new Set(
        a_o_p.map(v => `${v.x},${v.y},${v.z}`)
    );

    // Step 2: Convert back to {x, y, z} objects
    const filteredVertices = Array.from(uniqueVertices).map(str => {
        const [x, y, z] = str.split(',').map(Number);
        return {x, y, z};
    });
    console.log(filteredVertices)
    a_o_p = filteredVertices;
    function rotatePoint(point, center, angle) {
        // Translate point to origin
        const translatedX = point.x - center.x;
        const translatedY = point.y - center.y;
        
        // Apply rotation
        const rotatedX = translatedX * Math.cos(angle) - translatedY * Math.sin(angle);
        const rotatedY = translatedX * Math.sin(angle) + translatedY * Math.cos(angle);
        
        // Translate back
        return {
            x: rotatedX + center.x,
            y: rotatedY + center.y
        };
    }
    
    const n_tau = Math.PI * 2;
    // all units in millimeter mm
    let n_height = 100.;
    let n_layer_height = 1;
    let n_its_layer = parseInt(n_height / n_layer_height);
    let a_o_geometry = []
    let n_corners = 40.;
    let a_o_p_outside = [];
    let n_radius_base = n_height * 0.5;
    
    function f_o_vec(x, y, z) {
        return { n_x: x, n_y: y, n_z: z };
    }
    
    function f_a_o_p(n_it_layer_nor) {
        const rotationAngle = n_tau*0.2; // Rotate by 0.2 radians each layer
        
        let a_o = a_o_p.map(o => {
            // Create 3D point with z-coordinate
            let o_3d = {
                n_x: o.x,
                n_y: o.y,
                n_z: n_it_layer_nor * n_height
            };
            
            // Rotate the 2D projection (x,y) around center (0,0)
            const rotated = rotatePoint(
                { x: o_3d.n_x, y: o_3d.n_y },
                { x: 0, y: 0 },
                rotationAngle * n_it_layer_nor
            );
            
            return {
                n_x: rotated.x,
                n_y: rotated.y,
                n_z: o_3d.n_z
            };
        });
        
        n_corners = a_o.length;
        return a_o;
    }
    
    for (let n_it_layer = 1.; n_it_layer <= n_its_layer; n_it_layer += 1) {
        let n_it_layer_nor = n_it_layer / n_its_layer;
        let a_o_p = f_a_o_p(n_it_layer_nor);
        a_o_p_outside.push(...a_o_p);
    }
    
    // Assuming these functions are defined elsewhere:
    // function f_o_geometry_from_a_o_p_polygon_vertex(points, corners) { ... }
    // function f_o_shaded_mesh(geometry) { ... }
    
    a_o_geometry = [
        // the outside/'skirt' of the extruded polygon
        f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
    ];
    
    let a_o_mesh = a_o_geometry.map(o => f_o_shaded_mesh(o));
    return a_o_mesh;
    
            }