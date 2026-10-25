# Reference imagery

The geometry overlay in the Playground compares the rendered instrument
against a photograph of a real G5. That photograph is Garmin's, so it is not
committed here and not published with the site.

To use the overlay, put a straight-on image of a G5 **screen** -- cropped to
the display area, without the bezel -- at:

    public/reference/g5-pfd.png

`public/reference/` is gitignored. The overlay toggle in the Playground
sidebar hides itself when the file is absent, so nothing breaks without it.

## Where the layout numbers came from

Every constant in `src/G5/config/layout.js` was measured off the reference
figures in the G5 pilot's guide (Garmin 190-01112-12) rather than estimated:

| Measurement      | Value                                      |
| ---------------- | ------------------------------------------ |
| Pitch ladder     | 11.04 grid px per degree, marks every 2.5° |
| Mark half-widths | 24 / 50 / 74 px at 2.5° / 5° / 10°         |
| Roll arc         | radius 262, centred on the aircraft symbol |
| Airspeed tape    | 12 px per knot, labels every 10 kt         |
| Altitude tape    | 1.8 px per foot, giving 400 ft in view     |
| Heading tape     | 15.1 px per degree                         |
| Vertical speed   | 0.216 px per fpm, ±1500 fpm                |

The grid is 960x720: the G5's real 320x240 display at 3x.
