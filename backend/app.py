from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    redirect,
    session,
    send_file
)

from flask_cors import CORS
import mysql.connector

from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

import os

app = Flask(__name__)

app.secret_key = "studenthub_secret"

CORS(app)

# ==========================
# DATABASE
# ==========================

db = mysql.connector.connect(
    host="localhost",
    port=3307,
    user="root",
    password="yourpassword",
    database="student_db"
)

cursor = db.cursor(dictionary=True)

# ==========================
# STUDENT ID GENERATOR
# ==========================

def generate_student_id():

    cursor.execute(
        "SELECT COUNT(*) AS total FROM students"
    )

    total = cursor.fetchone()["total"]

    return f"STU{total + 1:03d}"

# ==========================
# PAGES
# ==========================

@app.route("/")
def login_page():
    return render_template("login.html")


@app.route("/register-page")
def register_page():
    return render_template("register.html")


@app.route("/dashboard")
def dashboard():

    if "user" not in session:
        return redirect("/")

    return render_template("index.html")

# ==========================
# REGISTER
# ==========================

@app.route("/register", methods=["POST"])
def register():

    data = request.json

    cursor.execute(
        """
        INSERT INTO users
        (
            username,
            email,
            password
        )
        VALUES
        (
            %s,
            %s,
            %s
        )
        """,
        (
            data["username"],
            data["email"],
            data["password"]
        )
    )

    db.commit()

    return jsonify({
        "message":
        "Registration Successful"
    })

# ==========================
# LOGIN
# ==========================

@app.route("/login", methods=["POST"])
def login():

    data = request.json

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE email=%s
        AND password=%s
        """,
        (
            data["email"],
            data["password"]
        )
    )

    user = cursor.fetchone()

    if user:

        session["user"] = user["username"]

        return jsonify({
            "success": True
        })

    return jsonify({
        "success": False
    })

# ==========================
# LOGOUT
# ==========================

@app.route("/logout")
def logout():

    session.clear()

    return redirect("/")

# ==========================
# CREATE STUDENT
# ==========================

@app.route("/students", methods=["POST"])
def add_student():

    data = request.json

    student_id = generate_student_id()

    cursor.execute(
        """
        INSERT INTO students
        (
            student_id,
            name,
            email,
            course,
            age,
            phone
        )
        VALUES
        (
            %s,
            %s,
            %s,
            %s,
            %s,
            %s
        )
        """,
        (
            student_id,
            data["name"],
            data["email"],
            data["course"],
            data["age"],
            data["phone"]
        )
    )

    db.commit()

    return jsonify({
        "message":
        "Student Added Successfully"
    })

# ==========================
# READ STUDENTS
# ==========================

@app.route("/students", methods=["GET"])
def get_students():

    cursor.execute(
        """
        SELECT *
        FROM students
        ORDER BY id DESC
        """
    )

    students = cursor.fetchall()

    return jsonify(students)

# ==========================
# STUDENT DETAILS
# ==========================

@app.route("/students/<int:id>", methods=["GET"])
def get_student(id):

    cursor.execute(
        """
        SELECT *
        FROM students
        WHERE id=%s
        """,
        (id,)
    )

    student = cursor.fetchone()

    return jsonify(student)

# ==========================
# UPDATE
# ==========================

@app.route("/students/<int:id>", methods=["PUT"])
def update_student(id):

    data = request.json

    cursor.execute(
        """
        UPDATE students
        SET
        name=%s,
        email=%s,
        course=%s,
        age=%s,
        phone=%s
        WHERE id=%s
        """,
        (
            data["name"],
            data["email"],
            data["course"],
            data["age"],
            data["phone"],
            id
        )
    )

    db.commit()

    return jsonify({
        "message":
        "Student Updated Successfully"
    })

# ==========================
# DELETE
# ==========================

@app.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):

    cursor.execute(
        """
        DELETE FROM students
        WHERE id=%s
        """,
        (id,)
    )

    db.commit()

    return jsonify({
        "message":
        "Student Deleted Successfully"
    })

# ==========================
# COURSE CHART
# ==========================

@app.route("/course-chart")
def course_chart():

    cursor.execute(
        """
        SELECT
        course,
        COUNT(*) AS total
        FROM students
        GROUP BY course
        """
    )

    data = cursor.fetchall()

    return jsonify(data)

# ==========================
# EXPORT PDF
# ==========================

@app.route("/export-pdf")
def export_pdf():

    cursor.execute(
        """
        SELECT
        student_id,
        name,
        email,
        course,
        age,
        phone
        FROM students
        """
    )

    students = cursor.fetchall()

    filename = "students_report.pdf"

    doc = SimpleDocTemplate(filename)

    elements = []

    styles = getSampleStyleSheet()

    title = Paragraph(
        "Student Report",
        styles["Title"]
    )

    elements.append(title)
    elements.append(Spacer(1, 20))

    data = [[
        "Student ID",
        "Name",
        "Email",
        "Course",
        "Age",
        "Phone"
    ]]

    for student in students:

        data.append([
            student["student_id"],
            student["name"],
            student["email"],
            student["course"],
            str(student["age"]),
            student["phone"]
        ])

    table = Table(data)

    table.setStyle(
        TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.purple),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('BACKGROUND', (0,1), (-1,-1), colors.whitesmoke)
        ])
    )

    elements.append(table)

    doc.build(elements)

    return send_file(
        filename,
        as_attachment=True
    )

# ==========================

if __name__ == "__main__":

    app.run(
        debug=True
    )