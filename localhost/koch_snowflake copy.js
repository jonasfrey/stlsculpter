function() {


    function getTSquareFractalOutline(iterations = 3, size = 100, center = { x: 0, y: 0 }) {
        // Initialize with the outer square (iteration 0)
        const halfSize = size / 2;
        let outerPoints = [
            { x: center.x - halfSize, y: center.y - halfSize }, // Top-left
            { x: center.x + halfSize, y: center.y - halfSize }, // Top-right
            { x: center.x + halfSize, y: center.y + halfSize }, // Bottom-right
            { x: center.x - halfSize, y: center.y + halfSize },  // Bottom-left
            { x: center.x - halfSize, y: center.y - halfSize }  // Close square
        ];
    
        // Recursive subdivision to carve out inner squares
        function subdivide(points, depth) {
            if (depth === 0) return points;
    
            const newPoints = [];
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
    
                // Split each edge into 3 segments (T-Square rule)
                const a = p1;
                const b = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
                const c = { x: p1.x + 2 * dx / 3, y: p1.y + 2 * dy / 3 };
                const d = p2;
    
                // For horizontal/vertical edges, add the "T" protrusions
                if (dy === 0 || dx === 0) { // Only for axis-aligned edges
                    const dir = dy === 0 ? { x: 0, y: 1 } : { x: 1, y: 0 }; // Direction to "push" the T
                    const bumpSize = size / (3 * Math.pow(2, iterations - depth));
                    const bump = {
                        x: b.x + dir.x * bumpSize,
                        y: b.y + dir.y * bumpSize
                    };
                    const bump2 = {
                        x: c.x + dir.x * bumpSize,
                        y: c.y + dir.y * bumpSize
                    };
                    newPoints.push(a, b, bump, { x: b.x, y: b.y }, c, bump2, { x: c.x, y: c.y }, d);
                } else {
                    newPoints.push(a, b, c, d);
                }
            }
            newPoints.push(points[points.length - 1]); // Close the shape
            return subdivide(newPoints, depth - 1);
        }
    
        return subdivide(outerPoints, iterations);
    }
    

    
    function rotatePoint(point, center, angle) {
        // Translate point to origin
        const translatedX = point.x - center.x;
        const translatedY = point.y - center.y;
        
        // Apply rotation
        const rotatedX = translatedX * Math.cos(angle) - translatedY * Math.sin(angle);
        const rotatedY = translatedX * Math.sin(angle) + translatedY * Math.cos(angle);
        
        // Translate back
        return {
            x: rotatedX + center.x,
            y: rotatedY + center.y
        };
    }
    
    const n_tau = Math.PI * 2;
    // all units in millimeter mm
    let n_height = 100.;
    let n_layer_height = 1;
    let n_its_layer = parseInt(n_height / n_layer_height);
    let a_o_geometry = []
    let n_corners = 40.;
    let a_o_p_outside = [];
    let n_radius_base = n_height * 0.5;
    
    function f_o_vec(x, y, z) {
        return { n_x: x, n_y: y, n_z: z };
    }
    
    function f_a_o_p(n_it_layer_nor) {
        const rotationAngle = n_tau*0.2; // Rotate by 0.2 radians each layer
        
        let a_o = getTSquareFractalOutline(
            4,
            n_radius_base + (Math.sin(n_it_layer_nor * n_tau * 0.92) * 0.5 + 0.5) * n_radius_base,
            { x: 0, y: 0 }
        ).map(o => {
            // Create 3D point with z-coordinate
            let o_3d = {
                n_x: o.x,
                n_y: o.y,
                n_z: n_it_layer_nor * n_height
            };
            
            // Rotate the 2D projection (x,y) around center (0,0)
            const rotated = rotatePoint(
                { x: o_3d.n_x, y: o_3d.n_y },
                { x: 0, y: 0 },
                rotationAngle * n_it_layer_nor
            );
            
            return {
                n_x: rotated.x,
                n_y: rotated.y,
                n_z: o_3d.n_z
            };
        });
        
        n_corners = a_o.length;
        return a_o;
    }
    
    for (let n_it_layer = 1.; n_it_layer <= n_its_layer; n_it_layer += 1) {
        let n_it_layer_nor = n_it_layer / n_its_layer;
        let a_o_p = f_a_o_p(n_it_layer_nor);
        a_o_p_outside.push(...a_o_p);
    }
    
    // Assuming these functions are defined elsewhere:
    // function f_o_geometry_from_a_o_p_polygon_vertex(points, corners) { ... }
    // function f_o_shaded_mesh(geometry) { ... }
    
    a_o_geometry = [
        // the outside/'skirt' of the extruded polygon
        f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
    ];
    
    let a_o_mesh = a_o_geometry.map(o => f_o_shaded_mesh(o));
    return a_o_mesh;
    
            }