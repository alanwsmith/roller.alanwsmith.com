use minijinja::Environment;
use serde_json::Value;
use std::fs;

fn main() {
    println!("Generating Page");
    let template = include_str!("template.j2");
    let json = include_str!("data.json");
    let output = render(template, json);
    fs::write("site/index.html", output).unwrap();
}

fn render(template: &str, json: &str) -> String {
    let data: Value = serde_json::from_str(json).unwrap();
    let env = Environment::new();
    env.render_str(template, data).unwrap()
}
