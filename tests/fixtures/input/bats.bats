#!/usr/bin/env bats

setup( ){
export APP_ENV=test
}

@test "prints configured env"  {
run bash -c 'echo "$APP_ENV"'
[ "$status" -eq 0 ]
[ "$output" = "test" ]
}

@test "supports arithmetic" {
run bash -c 'echo $((2+3))'
 [ "$status" -eq 0 ]
[ "$output" = "5" ]
}
