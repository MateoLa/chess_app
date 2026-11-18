Rails.application.config.dartsass.build_options |= [
    "--quiet",
    "--quiet-deps",
    "--silence-deprecation=import",
    "--silence-deprecation=global-builtin",
    "--silence-deprecation=color-functions"
]

Rails.application.config.dartsass.builds = {
    "application.scss" => "application.css"
}
