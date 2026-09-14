/**
 * Courbe lissée (interpolation Catmull-Rom convertie en Bézier cubique) pour les
 * tracés SVG des graphiques — un rendu plus fluide qu'une ligne brisée point à
 * point, réutilisé par tous les graphiques à courbe de l'app.
 */
export function smoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`;
  if (points.length === 2) return `M${points[0][0]},${points[0][1]} L${points[1][0]},${points[1][1]}`;
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0]},${p2[1]}`;
  }
  return d;
}
