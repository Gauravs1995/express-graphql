import jwt from 'jsonwebtoken';

export default function Auth(req, res, next) {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesuperlongkey');
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  try {
    req.isAuth = true;
    req.userId = decodedToken.userId;
  } catch {
    throw new Error('Error occured: ' + decodedToken);
  }

  return next();
}
