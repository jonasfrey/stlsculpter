async function() {
    let o_mod = await import("./threejs_custom_extrusions.js");
    let p1 = {x:0, y: 0}
    let p2 = {x:20, y: 20}
    let n_its_layer = 5
    let n_thick_base = 1
    let n_extrusion_base = 1
    let a_o_mesh = o_mod.f_a_o_mesh_boxline(
        p1,
        p2,
        n_its_layer,
        n_thick_base,
        n_extrusion_base,
    );

    return a_o_mesh;
}