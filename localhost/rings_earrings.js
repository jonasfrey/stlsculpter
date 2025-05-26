
async function() {
    let a_o_mesh = [];
    let o_mod = await import("./threejs_custom_extrusions.js");
    let n_its_layer = 3
    let n_thick_base = 0.0
    let n_thick_per_layer = 3
    let n_extr = 1;
    let n_extrusion_per_layer = 0.6
    // Create a ring shape
    let n_radius_inner = 3;
    let n_thick = 2;
    let n_radius_outer = n_radius_inner+n_thick;
    let shape = new THREE.Shape();
    let hole = new THREE.Path();

    let n_radius_inner_min = 3;
    let n_radius_inner_max = 30;
    let n_its = 3; 
    for(let n_it = 0; n_it < n_its; n_it+=1){
        let n_it_nor = n_it / n_its;
        
        n_radius_inner = n_radius_inner_min+n_it_nor*n_radius_inner_max;
        n_radius_outer = n_radius_inner+n_thick;

            // Outer circle
        shape.absarc(0, 0, n_radius_outer, 0, Math.PI * 2, false);

        // Inner circle (hole)
        hole.absarc(0, 0, n_radius_inner, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        // Extrude settings with bevel
        const extrudeSettings = {
            depth: n_extr,           // How deep to extrude
            bevelEnabled: true,  // Enable bevel
            bevelSegments: 1,    // Number of bevel segments
            bevelSize: 1,     // How deep into the original shape bevel goes
            bevelThickness: 1, // How deep from original shape is bevel
            bevelOffset: 0.0,      // How far from shape outline is bevel
            curveSegments: 64    // Number of segments per shape curve
        };

        // Create extruded geometry
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        let o_mesh_ring = f_o_shaded_mesh(geometry);
        o_mesh_ring.position.y = n_radius_inner;       
        a_o_mesh.push(o_mesh_ring)
    }

    return a_o_mesh;

}
