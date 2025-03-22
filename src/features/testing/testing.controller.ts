import { Controller, Delete } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";


@Controller('testing')
export class TestingController {
    constructor(@InjectConnection() private readonly databaseConnection:Connection) {}

    @Delete('all-data')
    async deleteAllData() {
        await this.databaseConnection.dropDatabase();
        return {
            status:'succeeded'
        }
    }


}