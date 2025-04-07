let o = f_o_function(
    'template_voronoi_negative', 
    function() {
        let f_o_vec = function (x, y, z) { return { n_x: x, n_y: y, n_z: z }; }
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
    
        const n_tau = Math.PI * 2;
        // all units in millimeter mm
        let n_height = 100.;
        let n_layer_height = 0.6;
        let n_its_layer = parseInt(n_height / n_layer_height);
        let a_o_geometry = []
        let n_corners = 550.;
        let a_o_p_outside = [];
        let n_radius_base = n_height / 1.618;
        // const phi = (1 + Math.sqrt(5)) / 2;
        let n_its_randompoint = 100;
        let f_n_radius = function (
            n_it_nor_layer
        ) {
            return n_radius_base + Math.sin(n_it_nor_layer * 0.95 * n_tau) * n_radius_base * 0.2;
        }
        let a_o_random = new Array(n_its_randompoint).fill(o).map((v, n_idx) => {
            let n_it_randompoint_nor = parseInt(n_idx) / n_its_randompoint;
            let n_rand_nor = Math.random();
            let n_rand_nor2 = Math.random();
            let n_z = n_height * n_rand_nor;
            let n_radius = f_n_radius(n_rand_nor)-10// -10 is negative if the radius is bigger it will 'blow' out the circles if its smaller it will carve them;
            return f_o_vec(
                Math.sin(n_rand_nor2 * n_tau) * n_radius,
                Math.cos(n_rand_nor2 * n_tau) * n_radius,
                n_z
            )
        })
    
    
        function f_a_o_p(
            n_it_layer_nor
        ) {
    
            let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                let n_it = parseFloat(n_idx);
                let n_it_nor_corner = n_it / n_corners;
                let n_rad_offset = 0;
                let n_radius = f_n_radius(n_it_layer_nor);
                let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                    Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_radius,
                    Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_radius,
                    n_it_layer_nor * n_height
                );
                let ndmin = null;
                let nd = 0;
                for (let o of a_o_random) {
                    nd = f_n_dist(o_trn1, o);
    
                    if (nd < ndmin || ndmin == null) {
                        ndmin = nd
                    }
                }
    
                n_radius += ndmin * .5;
                o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                    Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_radius,
                    Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_radius,
                    n_it_layer_nor * n_height
                );
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
)