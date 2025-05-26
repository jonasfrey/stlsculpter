

async function() {


    let a_o_mesh = [];
    let o_mod = await import("./threejs_custom_extrusions.js");

    // Usage:
    let size = 10;
    const gridSize = 5;
    const tetraSize = 1;
    const geometry = new THREE.TetrahedronGeometry(size);
    // Rotate the geometry to lay flat on X/Y plane
    geometry.rotateX(Math.PI / 2); // 90 degree rotation around X axis
    geometry.rotateZ(Math.PI / 4); // 45 degree rotation around Z axis
    let o_mesh = f_o_shaded_mesh(geometry);
    a_o_mesh.push(o_mesh);

    return a_o_mesh;

}