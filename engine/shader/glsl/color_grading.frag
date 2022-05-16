#version 310 es

#extension GL_KHR_vulkan_glsl : enable
#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    // 16
    highp float _COLORS = float(lut_tex_size.y);
    // 256
    highp float tex_width = float(lut_tex_size.x);
    
    highp vec4 color = subpassLoad(in_color).rgba;

    // map the color value from [0, 1] to [0, _COLORS]
    highp float blue_value = color.b * (_COLORS - 1.0);
    highp float red_value = color.r * (_COLORS - 1.0);
    highp float green_value = color.g * (_COLORS - 1.0);

    // find blue value belong to which block
    highp float floor_blue_value = floor(blue_value);
    highp float ceil_blue_value = ceil(blue_value);

    // uv.x
    highp float uv_x1 = (floor_blue_value * _COLORS + red_value) / tex_width;
    highp float uv_x2 = (ceil_blue_value * _COLORS + red_value) / tex_width;

    // uv.v
    highp float uv_v =  green_value / _COLORS;

    highp vec2 uv1 = vec2(uv_x1, uv_v);
    highp vec2 uv2 = vec2(uv_x2, uv_v);

    highp vec3 texture1 = texture(color_grading_lut_texture_sampler, uv1).rgb;
    highp vec3 texture2 = texture(color_grading_lut_texture_sampler, uv2).rgb;

    color.rgb = mix(texture1, texture2, fract(blue_value));

    // texture(color_grading_lut_texture_sampler, uv)

    out_color = color;
}
