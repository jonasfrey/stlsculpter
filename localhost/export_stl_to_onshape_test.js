
function(){

    // Create two meshes
    let n_layer_height = 0.3;
    let n_extr_base = n_layer_height;
    let n_scl_x_pixel = 5
    let n_scl_y_pixel = 5;
    let n_dia = Math.sqrt(Math.pow(n_scl_x_pixel,2)+Math.pow(n_scl_y_pixel,2))
    let n_pixels_x = 22;
    let n_pixels_y = 22;
    let n_scl_margin_pixel_x = n_dia/2;
    let n_scl_margin_pixel_y = n_dia/2;
    let n_scl_x = n_pixels_x*n_dia;
    let n_scl_y = n_pixels_y*n_dia;


    let o_geo_pixel = new THREE.BoxGeometry(
        10,10,10
    );
    let o_mesh = f_o_shaded_mesh(o_geo_pixel);
    // const resultMesh = o_mod_csg.CSG.toMesh(o_box_csg_plane, o_mesh_plane.matrix, o_mat_plane);
    return [
        o_mesh, 
        // ...a_o_mesh_pixel
    ];
}
