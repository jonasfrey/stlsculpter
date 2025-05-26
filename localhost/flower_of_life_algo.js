
async function() {
    let o_mod = await import("./threejs_custom_extrusions.js");
    let n_radius_inner = 3;
    let n_thick = 0.4;
    let n_radius_outer = n_radius_inner+n_thick;
    let n_radius_range = n_radius_outer-n_radius_inner;
    let n_extrusion = 0.3;
    let n_polygon_points = 3;

    let a_o_mesh = [];
    let n_width = (n_radius_outer) * 2; // width of the triangle
    let n_height = n_width * Math.sqrt(3) / 2; // height of equilateral triangle

    let n_its = 5;
    let n_radius = n_radius_outer;
    let n_its_corner = 6;
    let n_tau = Math.PI * 2;


    for (let n_it = 0; n_it < n_its; n_it += 1) {
        if(n_it == 0){
            let o_geo = o_mod.f_o_extruded_ring(
                n_radius_inner,
                n_radius_outer,
                n_extrusion,
                32//n_polygon_points
            );
            let o_mesh = f_o_shaded_mesh(o_geo);
            a_o_mesh.push(o_mesh);
            continue
        }
        let n_its_per_side = (n_it);
        // n_radius = n_it * n_radius_outer
        // n_radius = n_it * n_radius_inner
        n_radius = n_it * n_radius_inner+(n_radius_range/2);
        for (let n_it_corner = 0; n_it_corner < n_its_corner; n_it_corner += 1) {

            let n_it_corner2 = n_it_corner + 1;
            let n_it_corner_nor = n_it_corner / n_its_corner;
            let n_it_corner2_nor = n_it_corner2 / n_its_corner;

            
            let o_p1 = {
                n_x: Math.cos(n_it_corner_nor * n_tau) * n_radius,
                n_y: Math.sin(n_it_corner_nor * n_tau) * n_radius,
            }
            let o_p2 = {
                n_x: Math.cos(n_it_corner2_nor * n_tau) * n_radius,
                n_y: Math.sin(n_it_corner2_nor * n_tau) * n_radius,
            };
            let o_p_delta = {
                n_x: o_p2.n_x - o_p1.n_x,
                n_y: o_p2.n_y - o_p1.n_y,
            };
            console.log({n_its_per_side})
            for (let n_it_per_side = 0; n_it_per_side < n_its_per_side; n_it_per_side += 1) {
                let n_it_per_side_nor = n_it_per_side / n_its_per_side;
                console.log({n_it_per_side_nor})
                let o_p = {
                    n_x: o_p1.n_x + o_p_delta.n_x * n_it_per_side_nor,
                    n_y: o_p1.n_y + o_p_delta.n_y * n_it_per_side_nor,
                }
                // let a_o_mesh = o_mod.f_a_o_mesh_hexagonal_triangle_tiling(
                //         n_radius_inner,
                //         n_radius_outer,
                //         n_extrusion
                // ).map(o_mesh =>{
                //     o_mesh.position.set(
                //         o_mesh.position.x + o_p.n_x, 
                //         o_mesh.position.y + o_p.n_y,
                //         0.
                //     );
                //     return o_mesh;
                // })
                // a_o_mesh.push(...a_o_mesh)
                let o_geo = o_mod.f_o_extruded_ring(
                    n_radius_inner,
                    n_radius_outer,
                    n_extrusion,
                    32//n_polygon_points
                );
                let o_mesh = f_o_shaded_mesh(o_geo);
                o_mesh.position.x = o_p.n_x;
                o_mesh.position.y = o_p.n_y;
                a_o_mesh.push(o_mesh);
            }
        }
    }


     
    // a_o_mesh = o_mod.f_a_o_mesh_hexagonal_triangle_tiling(
    //     n_radius_inner,
    //     n_radius_outer,
    //     n_extrusion
    // );



    return a_o_mesh;
}