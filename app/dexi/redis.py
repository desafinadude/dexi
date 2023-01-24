import redis

def set_redis(user_id, type, data):
    r = redis.Redis(host='redis', port=6379, db=0)
    r.set(type + '-' + str(user_id), data)

def get_redis(user_id, type):
    r = redis.Redis(host='redis', port=6379, db=0)
    return r.get(type + '-' + str(user_id))
    