async function() {
    let a_o_mesh = [];
    let o_mod = await import("./threejs_custom_extrusions.js");
    let n_its_layer = 4
    let n_thick_base = 1
    let n_thick_per_layer = 3
    let n_extrusion_base = 0.4
    let n_extrusion_per_layer = 0.4


    let n_its = 18;
    let n_radius1 = 15;
    for(let n_it = 0; n_it < n_its; n_it+=1){
        let n_it_nor = n_it / n_its;
        let n_ang1 = n_it_nor
        let n_ang2 = (n_it_nor + 0.5)%1;
        let n_radius2 = n_radius1 + Math.sin(n_it_nor*n_tau*(n_its/3))*10;
        let o_p1 = {
            x: Math.sin(n_ang1*n_tau)*n_radius2,
            y: Math.cos(n_ang1*n_tau)*n_radius2,
        }
        let o_p2 = {
            x: Math.sin(n_ang2*n_tau)*n_radius2,
            y: Math.cos(n_ang2*n_tau)*n_radius2,
        }

        a_o_mesh.push(
            ...o_mod.f_a_o_mesh_boxline_layered(
                o_p1,
                o_p2,
                n_its_layer,
                n_thick_base,
                n_thick_per_layer,
                n_extrusion_base,
                n_extrusion_per_layer
            )
        )
    }

    let n_thick_ring = 1;
    let n_rad_ring = 3;
    let o_extruded_mesh = o_mod.f_o_extruded_ring(
        n_rad_ring-n_thick_ring,
        n_rad_ring+n_thick_ring, 
        n_extrusion_base,
        128
    );
    let o_mesh_ring = f_o_shaded_mesh(o_extruded_mesh);
    o_mesh_ring.y = 100;

    a_o_mesh.push(o_mesh_ring)

    return a_o_mesh;

}