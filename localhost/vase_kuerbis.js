function() {
    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 500.;
            let a_o_p_outside = [];
            let n_radius_base = n_height/1.618;
            let n_its_2 = 20.;
            // const phi = (1 + Math.sqrt(5)) / 2;
    
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            let f_n_dist = function (o, o2 = null) {
        if (o2 != null) {
            o = f_o_vec(
                o.n_x - o2.n_x,
                o.n_y - o2.n_y,
                o.n_z - o2.n_z,
            )
        }
        return Math.sqrt(
            Math.pow(o.n_x, 2)
            + Math.pow(o.n_y, 2)
            + Math.pow(o.n_z, 2)
        )
    }

            function f_a_o_p(
                n_it_layer_nor
                ) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx)+1;
                    let n_it_nor_corner = n_it / n_corners;
                    let n_it_2 = (n_it_nor_corner*n_its_2);
                    let n_it_2_flr = n_it_2%1;
                    let n_it_2_int = parseInt(n_it_2);

                    let n_amp = n_radius_base;
                    let n_rad_offset = 0;

                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        n_it_layer_nor*n_height
                    );

                    let n_amp2 = 5;
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_2_flr * n_tau) * n_amp2,
                        Math.cos(n_it_2_flr * n_tau) * n_amp2,
                        n_it_layer_nor*n_height
                    );
                    let o_trn3 = f_o_vec(
                        o_trn1.n_x+o_trn2.n_x,
                        o_trn1.n_y+o_trn2.n_y,
                        o_trn1.n_z+o_trn2.n_z,
                    )
                    let nl1 = f_n_dist(o_trn1);
                    let nl3 = f_n_dist(o_trn3);
                    if(nl3 > nl1){
                        return o_trn3
                    }
                    return o_trn1
        
        
                }).flat();
                return a_o
            }
        
        
        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
        
                let a_o_p = f_a_o_p(
                    n_it_layer_nor
                );
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, a_o_p[0].n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }