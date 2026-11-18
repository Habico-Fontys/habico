/* [Part] */
part = "assembly"; // [print, holder, bridge, cell, assembly]
variant = "slide"; // [click, slide]
test_fit = false;
test_cap_thickness = 1;

/* [Load cell] */
// The wire edge of the cell faces -y. Values marked "estimate" are not measured yet.
cell_size = 34;
cell_corner_radius = 10;
cell_rim_thickness = 2.5;
frame_width = 2.5;
wire_frame_width = 7;
slot_width = 3.5;
wire_slot_width = 2; // estimate
tongue_width = 8;
tongue_slot_width = 2; // estimate
tongue_slot_reach = 20; // estimate, wire edge to tip
rivet_line = 13.75;
rivet_pitch = 18.5;
rivet_head_d = 5;
rivet_head_height = 1;
strap_size = [24, 10];
strap_thickness = 2; // estimate
ball_protrusion = 5.3;
ball_d = 6;
ball_clearance = 1.5;
slide_play = 0.1;

/* [Holder] */
screw_mount = false;
screw_plate_size = 55;
holder_wall = 2;
plate_corner_radius = 4;
floor_thickness = 1.6;
lip_thickness = 0.8;
lip_depth = 1;
window_clearance = 1;
standoff_height = test_fit ? 0 : ball_protrusion + ball_clearance - floor_thickness;

/* [Wire channel] */
channel_width = 6;
channel_bridge = false;
channel_bridge_length = 3;
tunnel_height = 3;
cable_notch_reach = 7; // estimate, how far the sleeve and blob sit under the plate

/* [Click features] */
hook_flat_half_width = 5.056;
hook_blend_radius = 4;
nub_center_offset = 6;
nub_width = 6;
nub_tip_width = 5;
nub_depth = 0.4;
nub_chamfer = 0.2;

/* [Screws] */
head_recess = 0.6;
click_screw_offset = 20.5;
click_screw_hole_d = 4.5;
click_screw_head_d = 8;
click_countersink_angle = 82;
slide_screw_offset = 21;
slide_screw_hole_d = 3.4;
slide_screw_head_d = 6.5;
slide_countersink_angle = 90;

/* [Bridge] */
module_gap = 10;
cell_facings = [0, 180];
pad_height = 3;
center_clearance = 0.2;
socket_lip_thickness = 1.8;
socket_lip_depth = 1.5;
pad_tongue_clearance = 1;
bridge_plate_thickness = 6;
bridge_corner_radius = 4;

$fn = 96;
eps = 0.01;

is_slide = variant == "slide";
play = is_slide ? slide_play : 0;
pocket_size = cell_size + 2 * play;
pocket_radius = cell_corner_radius + play;
lip_bottom = floor_thickness + cell_rim_thickness + play;
plate_height = lip_bottom + lip_thickness;

screw_offset = is_slide ? slide_screw_offset : click_screw_offset;
screw_hole_d = is_slide ? slide_screw_hole_d : click_screw_hole_d;
screw_head_d = is_slide ? slide_screw_head_d : click_screw_head_d;
countersink_angle = is_slide ? slide_countersink_angle : click_countersink_angle;

wire_edge_y = -cell_size / 2;
frame_inner_x = cell_size / 2 - frame_width;
frame_inner_y0 = wire_edge_y + wire_frame_width;
frame_inner_y1 = cell_size / 2 - frame_width;
frame_inner_radius = cell_corner_radius - frame_width;
inner_x = frame_inner_x - slot_width;
inner_y0 = frame_inner_y0 + wire_slot_width;
inner_y1 = frame_inner_y1 - slot_width;
inner_corner_radius = frame_inner_radius - slot_width;
tongue_tip_y = wire_edge_y + tongue_slot_reach;
rivet_y = wire_edge_y + rivet_line;
pad_y0 = tongue_tip_y + pad_tongue_clearance;

plate_size = screw_mount ? screw_plate_size : pocket_size + 2 * holder_wall;
cell_pitch = plate_size + module_gap;
socket_reach = center_clearance + socket_lip_thickness;
bridge_plate_width = 2 * (inner_y1 + socket_reach);
bridge_plate_length = cell_pitch + 2 * (inner_x + socket_reach);
cell_top_z = standoff_height + floor_thickness + cell_rim_thickness;

if (part == "holder") holder();
else if (part == "bridge") bridge_print();
else if (part == "cell") load_cell();
else if (part == "print") print_plate();
else assembly();

module print_plate() {
    spacing = 5;
    holder_count = test_fit ? 1 : 2;
    holders_width = holder_count * plate_size + (holder_count - 1) * spacing;

    for (i = [0:holder_count - 1])
        translate([(i + 0.5) * plate_size + i * spacing - holders_width / 2, 0, 0]) holder();

    translate([0, -(plate_size + bridge_plate_width) / 2 - spacing, 0]) bridge_print();
}

module assembly() {
    for (i = [0, 1])
        translate([(i - 0.5) * cell_pitch, 0, 0])
            rotate(cell_facings[i]) {
                holder();
                translate([0, 0, standoff_height + floor_thickness]) % load_cell();
            }

    translate([0, 0, cell_top_z]) bridge();
}

module holder() {
    difference() {
        union() {
            translate([0, 0, standoff_height]) holder_plate();
            if (standoff_height > 0) standoff();
        }
        if (is_slide) underside_slot();
        cable_notch();
    }
}

module underside_slot() {
    translate([0, 0, -eps])
        linear_extrude(standoff_height + floor_thickness + 2 * eps)
            hull() {
                window_2d();
                translate([0, plate_size]) window_2d();
            }
}

module cable_notch() {
    length = (plate_size - cell_size) / 2 + cable_notch_reach;
    translate([-channel_width / 2, -plate_size / 2 - eps, -eps])
        cube([channel_width, length + eps, standoff_height + floor_thickness + 2 * eps]);
}

module window_2d() {
    offset(r = window_clearance) {
        inner_part_2d();
        tongue_2d();
        translate([0, rivet_y]) rounded_square(strap_size, 1);
    }
}

module holder_plate() {
    difference() {
        linear_extrude(plate_height) rounded_square(plate_size, plate_corner_radius);
        window();
        pocket();
        wire_channel();
        if (screw_mount) screw_holes();
    }
    if (!is_slide) click_features();
}

module standoff() {
    difference() {
        linear_extrude(standoff_height + eps) rounded_square(plate_size, plate_corner_radius);
        translate([0, 0, -eps]) linear_extrude(standoff_height + 3 * eps) window_2d();
        if (screw_mount)
            for (sx = [-1, 1], sy = [-1, 1])
                translate([sx * screw_offset, sy * screw_offset, -eps])
                    cylinder(d = screw_hole_d, h = standoff_height + 2 * eps);
    }
}

module rounded_square(size, r) {
    dims = is_num(size) ? [size, size] : size;
    offset(r) square(dims - 2 * [r, r], center = true);
}

module rounded_rect(x0, x1, y0, y1, r) {
    translate([x0, y0]) offset(r) translate([r, r]) square([x1 - x0 - 2 * r, y1 - y0 - 2 * r]);
}

module window() {
    translate([0, 0, -eps]) linear_extrude(floor_thickness + 2 * eps) window_2d();
}

module pocket() {
    translate([0, 0, floor_thickness])
        linear_extrude(lip_bottom - floor_thickness + eps) {
            rounded_square(pocket_size, pocket_radius);
            if (is_slide) entry_slot(pocket_size);
        }

    translate([0, 0, lip_bottom])
        linear_extrude(plate_height - lip_bottom + eps) {
            if (is_slide) {
                offset(delta = -lip_depth) rounded_square(pocket_size, pocket_radius);
                entry_slot(pocket_size - 2 * lip_depth);
            } else {
                rounded_square(pocket_size, pocket_radius);
            }
        }
}

module entry_slot(width) {
    translate([-width / 2, 0]) square([width, plate_size / 2 + eps]);
}

module wire_channel() {
    if (channel_bridge) bridged_wire_channel();
    else
        translate([-channel_width / 2, -plate_size / 2 - eps, floor_thickness])
            cube([channel_width, (plate_size - pocket_size) / 2 + 1, plate_height]);
}

module bridged_wire_channel() {
    tunnel_start = plate_size / 2 - channel_bridge_length;
    open_length = tunnel_start - pocket_size / 2 + 1;

    translate([-channel_width / 2, -tunnel_start, floor_thickness])
        cube([channel_width, open_length, plate_height]);

    translate([-channel_width / 2, -plate_size / 2 - eps, -eps])
        cube([channel_width, channel_bridge_length + 2 * eps, tunnel_height + eps]);

    translate([-channel_width / 2, 0, 0])
        rotate([90, 0, 90])
            linear_extrude(channel_width)
                polygon([
                    [-tunnel_start + floor_thickness, floor_thickness + eps],
                    [-tunnel_start - eps, -eps],
                    [-tunnel_start - eps, floor_thickness + eps]
                ]);
}

module screw_holes() {
    for (sx = [-1, 1], sy = [-1, 1])
        translate([sx * screw_offset, sy * screw_offset, 0]) countersunk_hole();
}

module countersunk_hole() {
    cone_height = (screw_head_d - screw_hole_d) / 2 / tan(countersink_angle / 2);
    cone_top = plate_height - head_recess;

    translate([0, 0, -eps]) cylinder(d = screw_hole_d, h = plate_height + 2 * eps);
    translate([0, 0, cone_top - cone_height])
        cylinder(d1 = screw_hole_d, d2 = screw_head_d, h = cone_height);
    translate([0, 0, cone_top - eps]) cylinder(d = screw_head_d, h = head_recess + 2 * eps);
}

module click_features() {
    translate([0, pocket_size / 2, lip_bottom])
        linear_extrude(plate_height - lip_bottom) hook_lip_2d();

    for (sx = [-1, 1])
        translate([sx * nub_center_offset, -pocket_size / 2, 0]) snap_nub();
}

module hook_lip_2d() {
    r = hook_blend_radius;
    d = lip_depth;
    a = acos(1 - d / (2 * r));
    end_x = hook_flat_half_width + 2 * r * sin(a);
    steps = 12;

    right = concat(
        [for (i = [0:steps]) let(t = a * i / steps)
            [hook_flat_half_width + r * sin(t), -d + r - r * cos(t)]],
        [for (i = [steps:-1:0]) let(t = a * i / steps)
            [end_x - r * sin(t), -r + r * cos(t)]]
    );
    left = [for (i = [len(right) - 1:-1:0]) [-right[i][0], right[i][1]]];

    polygon(concat(left, right, [[end_x, 1], [-end_x, 1]]));
}

module snap_nub() {
    hull() {
        nub_slice(lip_bottom - nub_chamfer, nub_chamfer);
        nub_slice(lip_bottom, 0);
        nub_slice(plate_height - nub_chamfer, 0);
        nub_slice(plate_height - eps, nub_chamfer);
    }
}

module nub_slice(z, chamfer) {
    depth = nub_depth - chamfer;
    base = nub_width / 2 - chamfer;
    tip = nub_tip_width / 2 - chamfer;

    translate([0, 0, z])
        linear_extrude(eps)
            polygon([[-base, -0.1], [base, -0.1], [tip, depth], [-tip, depth]]);
}

module bridge_print() {
    if (test_fit)
        translate([0, 0, test_cap_thickness + eps])
            rotate([180, 0, 0]) socket(test_cap_thickness);
    else
        translate([0, 0, pad_height + bridge_plate_thickness])
            rotate([180, 0, 0]) bridge();
}

module bridge() {
    for (i = [0, 1])
        translate([(i - 0.5) * cell_pitch, 0, 0])
            rotate(cell_facings[i]) socket();

    translate([0, 0, pad_height])
        linear_extrude(bridge_plate_thickness)
            rounded_square([bridge_plate_length, bridge_plate_width], bridge_corner_radius);
}

module socket(height = pad_height) {
    linear_extrude(height + eps) {
        pad_2d();
        intersection() {
            offset(r = socket_reach) inner_part_2d();
            pad_region_2d();
        }
    }

    translate([0, 0, -socket_lip_depth])
        linear_extrude(socket_lip_depth + eps) socket_lip_2d();
}

module pad_2d() {
    intersection() {
        inner_part_2d();
        pad_region_2d();
    }
}

module socket_lip_2d() {
    intersection() {
        difference() {
            offset(r = socket_reach) inner_part_2d();
            offset(r = center_clearance) inner_part_2d();
        }
        pad_region_2d();
    }
}

// Keeps the pad and its lip in the solid band between the tongue slot tips and the far
// edge, clear of the tongue, the tongue slots and the rivet heads.
module pad_region_2d() {
    translate([-cell_size / 2, pad_y0]) square([cell_size, cell_size]);
}

module inner_part_2d() {
    rounded_rect(-inner_x, inner_x, inner_y0, inner_y1, inner_corner_radius);
}

module frame_inner_2d() {
    rounded_rect(-frame_inner_x, frame_inner_x, frame_inner_y0, frame_inner_y1, frame_inner_radius);
}

module tongue_2d() {
    translate([-tongue_width / 2, frame_inner_y0]) square([tongue_width, tongue_tip_y - frame_inner_y0]);
}

module tongue_slot_2d() {
    r = tongue_slot_width / 2;
    hull() {
        translate([tongue_width / 2, frame_inner_y0]) square([tongue_slot_width, eps]);
        translate([tongue_width / 2 + r, tongue_tip_y - r]) circle(r);
    }
}

module cell_slot_2d() {
    difference() {
        union() {
            difference() {
                frame_inner_2d();
                inner_part_2d();
            }
            tongue_slot_2d();
            mirror([1, 0]) tongue_slot_2d();
        }
        translate([-tongue_width / 2, frame_inner_y0 - eps])
            square([tongue_width, inner_y0 - frame_inner_y0 + 2 * eps]);
    }
}

module load_cell() {
    color("silver") {
        difference() {
            linear_extrude(cell_rim_thickness) rounded_square(cell_size, cell_corner_radius);
            translate([0, 0, -eps]) linear_extrude(cell_rim_thickness + 2 * eps) cell_slot_2d();
        }

        for (sx = [-1, 1])
            translate([sx * rivet_pitch / 2, rivet_y, cell_rim_thickness - eps])
                cylinder(d = rivet_head_d, h = rivet_head_height + eps);

        translate([0, rivet_y, -strap_thickness])
            linear_extrude(strap_thickness + eps) rounded_square(strap_size, 1);

        translate([0, rivet_y, -ball_protrusion + ball_d / 2]) {
            cylinder(d = ball_d, h = ball_protrusion - ball_d / 2 - strap_thickness + eps);
            sphere(d = ball_d);
        }
    }
}
