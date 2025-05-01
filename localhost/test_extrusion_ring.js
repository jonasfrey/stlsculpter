
async function() {
    let a_o_mesh = []
    let o_mod = await import("./threejs_custom_extrusions.js");
    let n_inner = 10;
    let n_outer = 20;
    let n_extrusion = 2;
    let n_nor_start = 0.2; 
    let n_nor_end = 0.8;
    let n_resolution_vertices = 128;
    let o_extruded_mesh = o_mod.f_o_extruded_ring( 
        n_outer,
        n_inner,
        n_extrusion, 
        n_resolution_vertices,
        n_nor_start,
        n_nor_end
    );
    let o_mesh = f_o_shaded_mesh(o_extruded_mesh);

    a_o_mesh.push(o_mesh);
    return a_o_mesh
}