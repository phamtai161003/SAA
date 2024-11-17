class MongoDBRouter:
    """
    A router to control all database operations on models in the 'mongo' application.
    """

    def db_for_read(self, model, **hints):
        """
        Attempts to read mongo models go to MongoDB.
        """
        if model._meta.app_label in ['SAA']:  # Thay 'app_name' bằng tên ứng dụng của bạn dùng MongoDB
            return 'mongo'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write mongo models go to MongoDB.
        """
        if model._meta.app_label in ['SAA']:  # Thay 'app_name' bằng tên ứng dụng của bạn dùng MongoDB
            return 'mongo'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the 'mongo' app is involved.
        """
        if obj1._meta.app_label in ['SAA'] or obj2._meta.app_label in ['SAA']:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Prevent migrations on MongoDB.
        """
        if db == 'mongo':
            return False
        return True
