

async function() {
    let a_o_mesh = [];
    let o_mod = await import("./threejs_custom_extrusions.js");

    let o_p1 = {x: 0, y: 10, z: 0}
    let o_p_controll = {x: 0, y: 0, z: 0}
    let o_p2 = {x: 10, y: 0, z: 0}
    a_o_mesh.push(
        ...o_mod.f_a_o_mesh_cubicbezierboxregpoly(
            o_p1, 
            o_p_controll, 
            o_p2, 
            1, 
            3
        )
    )
    return a_o_mesh;
}