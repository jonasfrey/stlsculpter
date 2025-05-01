
async function() {
    let a_o_mesh = []
    let o_mod = await import("./threejs_custom_extrusions.js");

    let n_radius_inner = 10
    let n_circles = 3
    let n_thickness = 3
    let n_extrusion = 1 
    let b_show_inner = false

    let n_its_rep = 3;
    let n_thickness_per_rep = (n_thickness/n_its_rep);
    let n_extrusion_per_rep = 0.6;
    let n_radius_tangent_circle =
        n_radius_inner
            *(Math.sin(n_tau/2./n_circles));
    for(let n_it_rep = 0; n_it_rep<n_its_rep; n_it_rep+=1){
        let n_it_rep_nor = n_it_rep / n_its_rep;
        let n_thick = n_thickness-(n_thickness_per_rep*n_it_rep)
        a_o_mesh.push(
            ...o_mod.f_a_o_mesh_tangent_circles(
                n_radius_inner,
                n_circles,
                n_thick,
                n_extrusion+n_extrusion_per_rep*n_it_rep,
                b_show_inner
            )
        )
    }
    let n_rad2 = 3; 
    let n_thick2 = 1; 

    let o_extruded_mesh = o_mod.f_o_extruded_ring(
        n_rad2-n_thick2, 
        n_rad2+n_thick2,
        n_extrusion
    );
    let o_mesh = f_o_shaded_mesh(o_extruded_mesh);
    o_mesh.position.set(
        Math.sin(0)*(n_radius_inner+n_radius_tangent_circle+n_rad2), 
        Math.cos(0)*(n_radius_inner+n_radius_tangent_circle+n_rad2), 
        0,
    )
    a_o_mesh.push(o_mesh);


    return a_o_mesh
}