
async function() {
    let o_mod = await import("./threejs_custom_extrusions.js");
    let n_radius_inner = 2;
    let n_radius_outer = 3;
    let n_extrusion = 1;
    let n_polygon_points = 3;
    let n_nor_start = 0.;
    let n_nor_end = 1.;
    let o_geo = o_mod.f_o_extruded_ring(
        n_radius_inner, 
        n_radius_outer, 
        n_extrusion, 
        n_polygon_points,
        n_nor_start,
        n_nor_end
    )
    let o_mesh = f_o_shaded_mesh(o_geo);
    let a_o_mesh = [
        o_mesh
    ];

    let n_tau = Math.PI*2; 
    let n_its_row = 10; 
    let n_its_col = 10;

    // Calculate proper spacing for tiling
    let n_width = n_radius_outer * 2; // width of the triangle
    let n_height = n_width * Math.sqrt(3)/2; // height of equilateral triangle
    
    // Calculate proper spacing for hexagonal tiling
    let s = n_radius_outer * Math.sqrt(3); // side length
    let h = (Math.sqrt(3) / 2) * s; // height of the triangle
    
    for(let n_it_row = 0; n_it_row < n_its_row; n_it_row+=1){
        let n_it_row_nor = n_it_row / n_its_row;
        // let n_row_offset = (n_it_row % 2) * (n_width / 2);
        let n_row_offset = (n_it_row % 2) * (s / 2); // Offset odd rows


        for(let n_it_col = 0; n_it_col < n_its_col; n_it_col+=1){
            // Alternate rotation every other column in a checkerboard pattern
            let n_rot_nor = ((n_it_col + n_it_row) % 2) * 0.5;
            let n_it_col_nor = n_it_col / n_its_col;
            let o_mesh = f_o_shaded_mesh(o_geo);
            // let n_x = n_it_row*5;// this is a simple grid but the triangles dont make a 'tangent' surface / a tiled plane
            // let n_y = n_it_col*5;// this is a simple grid but the triangles dont make a 'tangent' surface / a tiled plane
            // Calculate position with proper spacing
            // let n_x = n_it_col * n_width + n_row_offset;
            // let n_y = n_it_row * n_height;

            let n_x = n_it_col * s + n_row_offset;
            let n_y = n_it_row * h;

            o_mesh.position.set(
                n_x, 
                n_y,
                0.
            );
            o_mesh.rotation.set(
                0,
                0,
                n_rot_nor*n_tau
            );
            a_o_mesh.push(
                o_mesh
            );
        }
    }


    return a_o_mesh;
}