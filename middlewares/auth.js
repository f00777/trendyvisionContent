import jwt from "jsonwebtoken";

export function checkAuth(req, res, next) {
  const token = req.cookies.auth_token; // 👈 viene de la cookie
  console.log("token: ", token)
  console.log("Jwt: ", process.env.JWT_SECRET )


  if (!token) {
    console.log("el wn no estaba autenticado")
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // guarda info del usuario
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
