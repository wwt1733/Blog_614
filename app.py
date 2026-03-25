from flask import Flask, request, redirect, url_for, render_template, jsonify, session
import config
from exts import db,migrate
from models import *
app = Flask(__name__)
app.config.from_object(config)

db.init_app(app)
migrate.init_app(app,db)
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/register',methods=['GET','POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        avatar = request.form.get('avatar')

        # 检查用户名是否已存在
        existing_user = db.session.scalar(db.select(User).where(User.username == username))
        if existing_user:
            return jsonify({"result": False, "msg": "用户名已存在"})

        user = User(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        return jsonify({"result":True,"msg":None})


@app.route('/login',methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        remember = request.form.get('remember')

        user = db.session.scalar(db.select(User).where(User.username == username))
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['avatar'] = user.avatar

            if remember:
                session.permanent = True
            return jsonify({"result": True, "msg": None, "user": {
                "id": user.id,
                "username": user.username,
                "avatar": user.avatar
            }})
        else:
            return jsonify({"result": False, "msg": "用户名或密码错误"})

@app.route('/api/current_user')
def current_user():
    if 'user_id' in session:
        return jsonify({
            "is_logged_in": True,
            "user": {
                "id": session['user_id'],
                "username": session.get('username'),
                "avatar": session.get('avatar')
            }
        })
    else:
        return jsonify({"is_logged_in": False})



@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

@app.route('/pub')
def pub():
    return render_template('pub.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')


if __name__ == '__main__':
    app.run()
