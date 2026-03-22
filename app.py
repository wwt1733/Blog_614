from flask import Flask, request, redirect, url_for, render_template, jsonify
import config
from exts import db,migrate
import models
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
        user = models.User(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        return jsonify({"result":True,"msg":None})


@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/pub')
def pub():
    return render_template('pub.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')


if __name__ == '__main__':
    app.run()
