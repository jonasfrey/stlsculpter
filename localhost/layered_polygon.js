async function() {
    let o_mod = await import("./threejs_custom_extrusions.js");
    let a_o_mesh = o_mod.f_a_o_mesh_layered_polygon(
        3,
        10,
        10,
        1,
        1
    );

    return a_o_mesh;
}