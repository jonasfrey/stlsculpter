

async function() {
    let a_o_mesh = [];
    let o_mod = await import("./threejs_custom_extrusions.js");
    let n_its_corner = 10;
    let n_radius = 20;
    let n_radius_control = 2.;
    let n_extrusion_base = 1.4;
    let n_its_corner_extrusion = 3;
    
    a_o_mesh.push(
        ...o_mod.f_a_o_mesh_bezierring(
            n_its_corner, 
            n_radius, 
            n_radius_control, 
            n_extrusion_base, 
            n_its_corner_extrusion
        )
    );

    let n_thick_ring = n_extrusion_base;
    let n_rad_ring = 3;

    // let o_extruded_mesh = o_mod.f_o_extruded_ring(
    //     n_rad_ring-n_thick_ring,
    //     n_rad_ring+n_thick_ring, 
    //     n_extrusion_base,
    //     128
    // );
    // let o_mesh_ring = f_o_shaded_mesh(o_extruded_mesh);
    // o_mesh_ring.position.y = n_radius+n_rad_ring;

    // a_o_mesh.push(o_mesh_ring)
    

    let a_o_ring2 = o_mod.f_a_o_mesh_bezierring(
        n_its_corner, 
        n_rad_ring, 
        n_rad_ring/2, 
        n_thick_ring, 
        n_its_corner_extrusion
    );
    a_o_mesh.push(
        ...a_o_ring2.map(o=>{
            o.position.y = n_radius+n_rad_ring-1;
            return o
        })
    )


    return a_o_mesh;
}