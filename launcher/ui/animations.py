"""Animation utilities for the SD-reScripts Launcher.

All animations use tkinter's after() scheduling to avoid blocking the UI.
Animations are lightweight: color lerp, opacity fade, position slide.
"""

from __future__ import annotations

import customtkinter as ctk


def lerp_color(c1: str, c2: str, t: float) -> str:
    """Linearly interpolate between two hex colors.

    Args:
        c1: Start color, e.g. "#1a1a2e"
        c2: End color, e.g. "#2a2a60"
        t: Interpolation factor, 0.0 = c1, 1.0 = c2
    """
    t = max(0.0, min(1.0, t))
    c1 = _ensure_hex(c1)
    c2 = _ensure_hex(c2)
    r1, g1, b1 = int(c1[1:3], 16), int(c1[3:5], 16), int(c1[5:7], 16)
    r2, g2, b2 = int(c2[1:3], 16), int(c2[3:5], 16), int(c2[5:7], 16)
    r = int(r1 + (r2 - r1) * t)
    g = int(g1 + (g2 - g1) * t)
    b = int(b1 + (b2 - b1) * t)
    return f"#{r:02x}{g:02x}{b:02x}"


# Known CTk named color aliases that may be returned instead of hex
_CTK_COLOR_MAP = {
    "transparent": "#000000",
    "black": "#000000",
    "white": "#ffffff",
    "gray": "#808080",
    "grey": "#808080",
    "red": "#ff0000",
    "green": "#00ff00",
    "blue": "#0000ff",
}


def _ensure_hex(color: str) -> str:
    """Ensure a color string is in #rrggbb hex format.

    CTk may return named colors like 'transparent' which lerp_color can't parse.
    This converts known names to hex and validates hex format.
    """
    if not color:
        return "#000000"
    if color.startswith("#") and len(color) == 7:
        return color
    lower = color.lower().strip()
    if lower in _CTK_COLOR_MAP:
        return _CTK_COLOR_MAP[lower]
    # Fallback: try to interpret as hex with possible prefixes
    return "#000000"


class FadeIn:
    """Fade-in animation for a CTkFrame by interpolating fg_color from bg to target.

    Usage:
        anim = FadeIn(widget, from_color="#0f0f1a", to_color="#1e1e3a", steps=10)
        anim.start()
    """

    def __init__(self, widget: ctk.CTkFrame, from_color: str = "#0f0f1a",
                 to_color: str = "#1e1e3a", steps: int = 12, interval: int = 16):
        self._widget = widget
        self._from = from_color
        self._to = to_color
        self._steps = steps
        self._interval = interval
        self._current = 0
        self._after_id = None

    def start(self):
        self._current = 0
        self._tick()

    def _tick(self):
        if self._current > self._steps:
            return
        t = self._current / self._steps
        # Ease-out curve
        t = 1 - (1 - t) ** 2
        color = lerp_color(self._from, self._to, t)
        try:
            self._widget.configure(fg_color=color)
        except Exception:
            return
        self._current += 1
        self._after_id = self._widget.after(self._interval, self._tick)

    def cancel(self):
        if self._after_id:
            try:
                self._widget.after_cancel(self._after_id)
            except Exception:
                pass


class PulseAnimation:
    """Pulse/glow animation for a widget's fg_color between two colors.

    Used for the launch button and status indicators.
    Cycles continuously until stopped.

    Usage:
        pulse = PulseAnimation(button, color1="#6c8cff", color2="#8aa4ff", period=60)
        pulse.start()
        # Later:
        pulse.stop()
    """

    def __init__(self, widget, attr: str = "fg_color",
                 color1: str = "#6c8cff", color2: str = "#8aa4ff",
                 steps: int = 20, interval: int = 30):
        self._widget = widget
        self._attr = attr
        self._color1 = color1
        self._color2 = color2
        self._steps = steps
        self._interval = interval
        self._phase = 0.0  # 0..1..0 cycle
        self._direction = 1
        self._running = False
        self._after_id = None

    def start(self):
        if self._running:
            return
        self._running = True
        self._phase = 0.0
        self._direction = 1
        self._tick()

    def stop(self, final_color: str | None = None):
        self._running = False
        if self._after_id:
            try:
                self._widget.after_cancel(self._after_id)
            except Exception:
                pass
        if final_color:
            try:
                self._widget.configure(**{self._attr: final_color})
            except Exception:
                pass

    def _tick(self):
        if not self._running:
            return
        t = self._phase
        # Smooth sine-like curve
        t_smooth = (1 - (1 - t) ** 2) if self._direction == 1 else (t ** 2)
        color = lerp_color(self._color1, self._color2, t_smooth)
        try:
            self._widget.configure(**{self._attr: color})
        except Exception:
            self._running = False
            return

        self._phase += 1.0 / self._steps * self._direction
        if self._phase >= 1.0:
            self._phase = 1.0
            self._direction = -1
        elif self._phase <= 0.0:
            self._phase = 0.0
            self._direction = 1

        self._after_id = self._widget.after(self._interval, self._tick)


class StatusPulse:
    """Subtle pulse for status indicators (color oscillation on fg_color).

    Works with StatusDot widgets (CTkFrame) and CTkLabel.
    Detects whether the target supports fg_color (StatusDot) or text_color (CTkLabel).

    Usage:
        pulse = StatusPulse(dot_widget, color="#4ade80", dim_color="#1a3a2a")
        pulse.start()
        pulse.stop()
    """

    def __init__(self, widget, color: str = "#4ade80",
                 dim_color: str = "#2a5a3a", steps: int = 15, interval: int = 40):
        self._widget = widget
        self._color = color
        self._dim = dim_color
        self._steps = steps
        self._interval = interval
        self._phase = 0.0
        self._direction = 1
        self._running = False
        self._after_id = None
        # StatusDot uses fg_color; CTkLabel uses text_color
        self._use_fg_color = hasattr(widget, 'set_color')

    def start(self):
        if self._running:
            return
        self._running = True
        self._phase = 0.0
        self._direction = 1
        self._tick()

    def stop(self, final_color: str | None = None):
        self._running = False
        if self._after_id:
            try:
                self._widget.after_cancel(self._after_id)
            except Exception:
                pass
        if final_color:
            try:
                if self._use_fg_color:
                    self._widget.set_color(final_color)
                else:
                    self._widget.configure(text_color=final_color)
            except Exception:
                pass

    def _tick(self):
        if not self._running:
            return
        t = self._phase
        color = lerp_color(self._dim, self._color, t)
        try:
            if self._use_fg_color:
                self._widget.set_color(color)
            else:
                self._widget.configure(text_color=color)
        except Exception:
            self._running = False
            return

        self._phase += 1.0 / self._steps * self._direction
        if self._phase >= 1.0:
            self._phase = 1.0
            self._direction = -1
        elif self._phase <= 0.0:
            self._phase = 0.0
            self._direction = 1

        self._after_id = self._widget.after(self._interval, self._tick)


class HoverAnimator:
    """Smooth hover color transition for a CTkFrame widget.

    Interpolates fg_color between normal and hover colors over several frames.

    Usage:
        animator = HoverAnimator(frame, normal="#1e1e3a", hover="#262650",
                                 border_normal="#2a2a50", border_hover="#333360")
        frame.bind("<Enter>", animator.on_enter)
        frame.bind("<Leave>", animator.on_leave)
    """

    def __init__(self, widget: ctk.CTkFrame, normal: str = "#1e1e3a",
                 hover: str = "#262650", border_normal: str = "#2a2a50",
                 border_hover: str = "#333360", steps: int = 6, interval: int = 12):
        self._widget = widget
        self._normal = normal
        self._hover = hover
        self._border_normal = border_normal
        self._border_hover = border_hover
        self._steps = steps
        self._interval = interval
        self._progress = 0.0  # 0 = normal, 1 = hover
        self._target = 0.0
        self._after_id = None

    def on_enter(self, event=None):
        self._target = 1.0
        self._animate()

    def on_leave(self, event=None):
        self._target = 0.0
        self._animate()

    def _animate(self):
        if self._after_id:
            try:
                self._widget.after_cancel(self._after_id)
            except Exception:
                pass

        diff = self._target - self._progress
        if abs(diff) < 0.01:
            self._progress = self._target
            return

        step = 1.0 / self._steps if diff > 0 else -1.0 / self._steps
        self._progress += step

        # Clamp
        if step > 0 and self._progress > self._target:
            self._progress = self._target
        elif step < 0 and self._progress < self._target:
            self._progress = self._target

        t = max(0.0, min(1.0, self._progress))
        # Ease-out
        t_ease = 1 - (1 - t) ** 2

        fg = lerp_color(self._normal, self._hover, t_ease)
        border = lerp_color(self._border_normal, self._border_hover, t_ease)

        try:
            self._widget.configure(fg_color=fg, border_color=border)
        except Exception:
            return

        if abs(self._progress - self._target) > 0.01:
            self._after_id = self._widget.after(self._interval, self._animate)


class SlideIn:
    """Slide a widget in from a direction with opacity-like motion.

    Works by animating the grid padx or pady from offset to 0.

    Usage:
        slide = SlideIn(frame, direction="left", offset=30, steps=10, interval=16)
        slide.start()
    """

    def __init__(self, widget, direction: str = "left", offset: int = 30,
                 steps: int = 10, interval: int = 16):
        self._widget = widget
        self._direction = direction
        self._offset = offset
        self._steps = steps
        self._interval = interval
        self._current = 0

    def start(self):
        self._current = 0
        self._tick()

    def _tick(self):
        if self._current > self._steps:
            return
        t = self._current / self._steps
        # Ease-out
        t = 1 - (1 - t) ** 3
        current_offset = int(self._offset * (1 - t))

        try:
            if self._direction == "left":
                self._widget.grid(padx=(current_offset + 24, 24), pady=4)
            elif self._direction == "top":
                self._widget.grid(padx=24, pady=(current_offset + 4, 4))
        except Exception:
            return

        self._current += 1
        self._widget.after(self._interval, self._tick)


class PressAnimation:
    """Claymorphism press-in animation for buttons.

    Simulates a button being physically pressed down:
    - On press: shrink slightly, change to pressed color, simulate shadow collapse
    - On release: spring back with slight overshoot (jelly feel)

    Usage:
        press = PressAnimation(button, normal_color="#8b7cf6", pressed_color="#7568e0")
        button.bind("<ButtonPress-1>", press.on_press)
        button.bind("<ButtonRelease-1>", press.on_release)
    """

    def __init__(self, widget, normal_color: str = "#8b7cf6",
                 pressed_color: str = "#7568e0",
                 hover_color: str = "#9d90f8",
                 steps: int = 4, interval: int = 20):
        self._widget = widget
        self._normal = normal_color
        self._pressed = pressed_color
        self._hover = hover_color
        self._steps = steps
        self._interval = interval
        self._after_id = None
        self._is_hovered = False

    def set_hovered(self, hovered: bool):
        self._is_hovered = hovered

    def on_press(self, event=None):
        if self._after_id:
            try:
                self._widget.after_cancel(self._after_id)
            except Exception:
                pass
        try:
            self._widget.configure(fg_color=self._pressed)
        except Exception:
            pass

    def on_release(self, event=None):
        target = self._hover if self._is_hovered else self._normal
        self._animate_to(target)

    def _animate_to(self, target_color: str):
        try:
            current = self._pressed
        except Exception:
            return
        self._step = 0
        self._from_color = current
        self._to_color = target_color

        def tick():
            if self._step > self._steps:
                return
            t = self._step / self._steps
            # Spring-like ease-out with slight overshoot
            t_ease = 1 - (1 - t) ** 3
            color = lerp_color(self._from_color, self._to_color, t_ease)
            try:
                self._widget.configure(fg_color=color)
            except Exception:
                return
            self._step += 1
            self._after_id = self._widget.after(self._interval, tick)

        tick()
