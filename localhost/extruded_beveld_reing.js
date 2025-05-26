
async function() {
    let a_o_mesh = [];
    let o_mod = await import("./threejs_custom_extrusions.js");
    let n_its_layer = 3
    let n_thick_base = 0.0
    let n_thick_per_layer = 3
    let n_extr = 1;
    let n_extrusion_per_layer = 0.6
    // Create a ring shape
    const innerRadius = 3;
    let n_thick = 2;
    const outerRadius = innerRadius+n_thick;
    const shape = new THREE.Shape();
    const hole = new THREE.Path();

    // Outer circle
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Inner circle (hole)
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
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
    a_o_mesh.push(o_mesh_ring)

    return a_o_mesh;

}
