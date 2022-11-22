package hw3

import scala.collection.immutable.HashMap 
import hw3._


package object hw3 {
  type Env = HashMap[Var,Val]
  type Loc = Int
  
}

case class Mem(m: HashMap[Loc,Val], top: Loc) {
  
}

sealed trait Val
case class IntVal(n: Int) extends Val
case class BoolVal(b: Boolean) extends Val
case class ProcVal(v: Var, expr: Expr, env: Env) extends Val
case class RecProcVal(fv: Var, av: Var, body: Expr, env: Env) extends Val
case class LocVal(l: Loc) extends Val


sealed trait Program
sealed trait Expr extends Program
case class Const(n: Int) extends Expr
case class Var(s: String) extends Expr
case class Add(l: Expr, r: Expr) extends Expr
case class Sub(l: Expr, r: Expr) extends Expr
case class Mul(l: Expr, r: Expr) extends Expr
case class Div(l: Expr, r: Expr) extends Expr
case class GTExpr(l: Expr, r: Expr) extends Expr
case class GEQExpr(l: Expr, r: Expr) extends Expr
case class Iszero(c: Expr) extends Expr
case class Ite(c: Expr, t: Expr, f: Expr) extends Expr
case class ValExpr(name: Var, value: Expr, body: Expr) extends Expr
case class VarExpr(name: Var, value: Expr, body: Expr) extends Expr
case class Proc(v: Var, expr: Expr) extends Expr
case class DefExpr(fname: Var, aname: Var, fbody: Expr, ibody: Expr) extends Expr
case class Asn(v: Var, e: Expr) extends Expr // assignment
case class Paren(expr: Expr) extends Expr
case class Block(f: Expr, s: Expr) extends Expr
case class PCall(ftn: Expr, arg: Expr) extends Expr // function call







object MiniScalaInterpreter {

  case class UndefinedSemantics(msg: String = "", cause: Throwable = None.orNull) extends Exception("Undefined Semantics: " ++ msg, cause)
  
  
  def doInterpret(env: Env, mem: HashMap[Loc,Val], expr: Expr): (Val, HashMap[Loc,Val]) =
    expr match {
      case Const(n: Int) => (IntVal(n), mem)
      case Iszero(c: Expr) =>
        doInterpret(env, mem, c) match {
          case (IntVal(x), newMem) if x == 0 => (BoolVal(true), newMem)
          case _ => (BoolVal(false), mem)
        }
      case Div(l: Expr, r: Expr) =>
        val L = doInterpret(env, mem, l)
        val R = doInterpret(env, L._2, r)
        (L._1, R._1) match {
          case (IntVal(a), IntVal(b)) if b != 0 => (IntVal(a/b), R._2)
          case _ => throw new UndefinedSemantics("wrong type")
        }
      case Sub(l: Expr, r: Expr) =>
        val L = doInterpret(env, mem, l)
        val R = doInterpret(env, L._2, r)
        (L._1, R._1) match {
          case (IntVal(a), IntVal(b)) => (IntVal(a-b), R._2)
          case _ => throw new UndefinedSemantics("wrong type")
        }
      case Mul(l: Expr, r: Expr) =>
        val L = doInterpret(env, mem, l)
        val R = doInterpret(env, L._2, r)
        (L._1, R._1) match {
          case (IntVal(a), IntVal(b)) => (IntVal(a*b), R._2)
          case _ => throw new UndefinedSemantics("wrong type")
        }
      case Add(l: Expr, r: Expr) =>
        val L = doInterpret(env, mem, l)
        val R = doInterpret(env, L._2, r)
        (L._1, R._1) match {
          case (IntVal(a), IntVal(b)) => (IntVal(a+b), R._2)
          case _ => throw new UndefinedSemantics("wrong type")
        }
      case GEQExpr(l: Expr, r: Expr) =>
        val L = doInterpret(env, mem, l)
        val R = doInterpret(env, L._2, r)
        (L._1, R._1) match {
          case (IntVal(a), IntVal(b)) => (BoolVal(a>=b), R._2)
          case _ => throw new UndefinedSemantics("wrong type")
        }
      case GTExpr(l: Expr, r: Expr) =>
        val L = doInterpret(env, mem, l)
        val R = doInterpret(env, L._2, r)
        (L._1, R._1) match {
          case (IntVal(a), IntVal(b)) => (BoolVal(a>b), R._2)
          case _ => throw new UndefinedSemantics("wrong type")
        }
      case Ite(c, t, f) =>
        val C = doInterpret(env, mem, c)
        C._1 match {
          case BoolVal(true) =>
            doInterpret(env, C._2, t)
          case BoolVal(false) =>
            doInterpret(env, C._2, f)
          case _ => throw new UndefinedSemantics("wrong type")
        }
      case Iszero(t) =>
        val T = doInterpret(env, mem, t)
        T._1 match {
          case IntVal(x) if x == 0 => (BoolVal(true), T._2)
          case _ => (BoolVal(false), T._2)
        }
      case ValExpr(name, value, body) =>
        val VALUE = doInterpret(env, mem, value)
        doInterpret(env + (name -> VALUE._1), VALUE._2, body)
      case VarExpr(name, value, body) =>
        val VALUE = doInterpret(env, mem, value)
        val tmp = mem.keys
        val addr = (mem.keys.maxOption.getOrElse(0) + 1)
        doInterpret(env + (name -> LocVal(addr)), VALUE._2 + (addr -> VALUE._1), body)
      case Var(name) =>
        env.get(Var(name)) match {
          case Some(c) => c match {
            case LocVal(addr) => mem.get(addr) match {
              case Some(v) => (v, mem)
              case _ => throw new UndefinedSemantics("not found")
            }
            case _ => (c, mem)
          }
          case _ => throw new UndefinedSemantics("not found")
        }
      case Asn(v: Var, e: Expr) =>
        val E = doInterpret(env, mem, e)
        env.get(v) match {
          case Some(addr) => addr match {
            case LocVal(addr) => mem.get(addr) match {
              case Some(v) => (v, E._2 + (addr -> E._1))
              case _ => throw new UndefinedSemantics("not found")
            }
            case _ => throw new UndefinedSemantics("not found")
          }
          case _ => throw new UndefinedSemantics("not found")
        }
      case Paren(expr: Expr) =>
        doInterpret(env,mem,expr)
      case Block(f: Expr, s: Expr) =>
        val F = doInterpret(env, mem, f)
        doInterpret(env, F._2, s)
      case Proc(v: Var, expr: Expr) =>
        (ProcVal(v, expr, env), mem)
      case DefExpr(fv,av,body,expr) =>
        val recProcVal = RecProcVal(fv, av, body, env)
        doInterpret(env + (fv -> recProcVal), mem, expr)
      case PCall(ftn: Expr, arg: Expr) =>
        val FTN = doInterpret(env, mem, ftn)
        val ARG = doInterpret(env, FTN._2, arg)
        FTN._1 match {
          case ProcVal(vv, eexpr, eenv) =>
            doInterpret(eenv + (vv -> ARG._1), ARG._2, eexpr)
          case RecProcVal(ffv, aav, bbody, eenv) =>
            doInterpret(eenv + (ffv -> FTN._1) + (aav -> ARG._1), ARG._2, bbody)
          case _ => throw new UndefinedSemantics("not found")
        }
      case _ =>
      (BoolVal(false), mem)
    }

  def apply(program: String): Val = {
    val parsed = MiniScalaParserDriver(program)
    doInterpret(new Env(), new HashMap(), parsed)._1
  }

}


object Hw3App extends App {
  println("Hello from Hw3!")

}