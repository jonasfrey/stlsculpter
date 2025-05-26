
async function() {
    let o_mod = await import("./threejs_custom_extrusions.js");
    let n_radius_inner = 3;
    let n_radius_outer = 3.8;
    let n_extrusion = 1;
    let n_polygon_points = 3;

    let n_width = (n_radius_outer) * 2; // width of the triangle

    let n_height = n_width * Math.sqrt(3)/2; // height of equilateral triangle

    let n_its_row = 10;
    let n_its_col = 18;
    let a_o_mesh = [];
    for(let n_it_row = 0; n_it_row < n_its_row; n_it_row+=1){

        for(let n_it_col = 0; n_it_col < n_its_col; n_it_col+=1){

            let a_o_mesh2 = o_mod.f_a_o_mesh_hexagonal_triangle_tiling(
                n_radius_inner,
                n_radius_outer,
                n_extrusion
            );

            let n_x = n_it_col * n_height; 
            let n_y = n_it_row * n_radius_outer*3;

            
            a_o_mesh2 = a_o_mesh2
            // .filter((o, n_idx)=>{
            //     if(n_it_row % 2 == 0){
            //         return n_idx <= 3 
            //     }else{
            //         return n_idx >= 3 || n_idx == 0
            //     }
            // })
            .map(o_mesh=>{
              
                o_mesh.position.set(
                    o_mesh.position.x + n_x, 
                    o_mesh.position.y + n_y,
                    0.
                );
                return o_mesh;
            })
            a_o_mesh.push(
                ...a_o_mesh2
            );
        }
    }

    // a_o_mesh = o_mod.f_a_o_mesh_hexagonal_triangle_tiling(
    //     n_radius_inner,
    //     n_radius_outer,
    //     n_extrusion
    // );



    return a_o_mesh;
}