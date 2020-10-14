import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn, ManyToOne
} from 'typeorm';
import {Sender} from '../user/sender.entity'
import {Courier} from '../user/courier.entity'

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sender)
  sender: Sender;

  @ManyToOne(() => Courier)
  courier: Courier;

  @Column({nullable: true})
  packageSize?: string;

  @Column({nullable: true})
  cost: number;
  
  @Column({nullable: true})
  description?: string;
  
  @CreateDateColumn()
  date
  
  constructor(data: Partial<Delivery> = {}) {
    Object.assign(this, data);
  }
}
